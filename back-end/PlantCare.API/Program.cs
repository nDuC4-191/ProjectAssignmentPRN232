// Path: PlantCare.API/Program.cs
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using PlantCare.Application.Interfaces;
using PlantCare.Application.Interfaces.Repository;
using PlantCare.Application.Services;
using PlantCare.Infrastructure.Models;
using System.Text;
using PlantCare.Application.DTOs.UserOrders;  
var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// ============================================
// ✅ SWAGGER CONFIGURATION - ĐÃ SỬA
// ============================================
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PlantCare API",
        Version = "v1",
        Description = "API quản lý cây trồng cá nhân và gợi ý chăm sóc"
    });

    // ✅ FIX: Dùng full namespace để tránh conflict tên DTO
    options.CustomSchemaIds(type => type.FullName?.Replace("+", "."));

    // JWT Bearer trong Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập token vào đây (chỉ cần paste, KHÔNG gõ chữ Bearer)"
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
            new string[] {}
        }
    });
});

// Database Context
builder.Services.AddDbContext<PlantCareContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// ============================================
// REGISTER SERVICES
// ============================================

// --- Đức Anh ---
builder.Services.AddScoped<ICategoryRepository, CategoryDARepository>();
builder.Services.AddScoped<ICategoryDAService, CategoryDAService>();
builder.Services.AddScoped<IUserDAService, UserDAService>();
builder.Services.AddScoped<IProductDAService, ProductDAService>();

// --- Cảnh ---
builder.Services.AddScoped<IFeedbackService, FeedbackService>();
builder.Services.AddScoped<IEmailService, EmailService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// --- Vinh ---
builder.Services.AddScoped<IUserPlantService, UserPlantService>();
builder.Services.AddScoped<ICareSuggestionService, CareSuggestionService>();
builder.Services.AddScoped<IPlantCareTipService, PlantCareTipService>();

// --- Vũ ---
builder.Services.AddScoped<IAuthenticationService, AuthenticationService>();
builder.Services.AddScoped<IUserProfileService, UserProfileService>();
builder.Services.AddScoped<IUserOrderService, UserOrderService>();
builder.Services.AddScoped<IShippingAddressService, ShippingAddressService>();

// --- Nhật ---
// (IOrderService đã đăng ký ở trên rồi)

// ============================================
// JWT AUTHENTICATION
// ============================================
var jwtSettings = builder.Configuration.GetSection("JwtSettings");
var secretKey = jwtSettings["SecretKey"];

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

// ============================================
// CORS
// ============================================
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyMethod()
              .AllowAnyHeader();
    });
});

var app = builder.Build();

// ============================================
// SEED ADMIN USER
// ============================================
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

// ============================================
// CONFIGURE HTTP REQUEST PIPELINE
// ============================================
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c =>
    {
        c.SwaggerEndpoint("/swagger/v1/swagger.json", "PlantCare API V1");
        c.RoutePrefix = string.Empty; // Swagger tại root
    });
}

app.UseHttpsRedirection();
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();