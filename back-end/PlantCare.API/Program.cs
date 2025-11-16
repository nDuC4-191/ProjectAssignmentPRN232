using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Newtonsoft.Json;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Interfaces.Repository;
using PlantCare.Application.Services;
using PlantCare.Infrastructure.Models;
using System.Text;
using Newtonsoft.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// Controllers + JSON
builder.Services.AddControllers()
    .AddNewtonsoftJson(options =>
    {
        options.SerializerSettings.ReferenceLoopHandling = ReferenceLoopHandling.Ignore;

        // ⭐ THÊM DÒNG NÀY
        options.SerializerSettings.ContractResolver =
            new Newtonsoft.Json.Serialization.CamelCasePropertyNamesContractResolver();
    });

builder.Services.AddEndpointsApiExplorer();

// Swagger
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PlantCare API",
        Version = "v1",
        Description = "API quản lý cây trồng cá nhân và gợi ý chăm sóc"
    });

    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));

    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Dán token vào đây (chỉ cần token, KHÔNG gõ Bearer)"
    });

    options.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            Array.Empty<string>()
        }
    });
    options.CustomSchemaIds(type => type.FullName);
});

// DbContext
builder.Services.AddDbContext<PlantCareContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"))
);

// Email config
builder.Services.Configure<PlantCare.Application.Settings.EmailSettings>(
    builder.Configuration.GetSection("EmailSettings")
);

// HttpContext
builder.Services.AddHttpContextAccessor();

// Dependency Injection
builder.Services.AddScoped<ICategoryRepository, CategoryDARepository>();
builder.Services.AddScoped<ICategoryDAService, CategoryDAService>();
builder.Services.AddScoped<IUserDAService, UserDAService>();
builder.Services.AddScoped<IProductDAService, ProductDAService>();

builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

builder.Services.AddScoped<IVNPayService, VNPayService>();
builder.Services.AddSingleton<IHttpContextAccessor, HttpContextAccessor>();
builder.Services.AddScoped<IUserPlantService, UserPlantService>();
builder.Services.AddScoped<ICareSuggestionService, CareSuggestionService>();
builder.Services.AddScoped<IPlantCareTipService, PlantCareTipService>();

builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IUserOrderService, UserOrderService>();
builder.Services.AddScoped<IShippingAddressService, ShippingAddressService>();

// JWT
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

if (string.IsNullOrEmpty(secretKey))
    throw new Exception("JWT SecretKey is missing in appsettings.json!");

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings["Issuer"],
        ValidAudience = jwtSettings["Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey)),
        ClockSkew = TimeSpan.Zero,
        NameClaimType = System.Security.Claims.ClaimTypes.NameIdentifier
    };
});

// CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.WithOrigins(
                "http://localhost:5173", // URL của React (Client)
                "https://sandbox.vnpayment.vn", // URL của VNPay Sandbox

                // === THÊM DÒNG NÀY ===
                "https://*.ngrok-free.dev"
            )
            .AllowAnyHeader()
            .AllowAnyMethod()
            .AllowCredentials() 
            .SetIsOriginAllowed(origin => true);
        });
});

var app = builder.Build();

// Auto migrate
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<PlantCareContext>();
    db.Database.Migrate();
}

// Seed Admin
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<PlantCareContext>();
    var adminConfig = builder.Configuration.GetSection("AdminAccount");
    string adminEmail = adminConfig["Email"];

    if (!context.Users.Any(u => u.Email == adminEmail))
    {
        var admin = new User
        {
            FullName = adminConfig["FullName"],
            Email = adminEmail,
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(adminConfig["Password"]),
            Phone = adminConfig["Phone"],
            Address = adminConfig["Address"],
            Role = "Admin",
            IsActive = true,
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        context.Users.Add(admin);
        context.SaveChanges();
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlantCare API V1");
        c.RoutePrefix = string.Empty;
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();
app.Run();
