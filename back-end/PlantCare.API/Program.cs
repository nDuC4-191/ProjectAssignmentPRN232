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

var builder = WebApplication.CreateBuilder(args);

// Add services to the container
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();

// Swagger với JWT
builder.Services.AddSwaggerGen(options =>
{
    options.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "PlantCare API",
        Version = "v1",
        Description = "API quản lý cây trồng cá nhân và gợi ý chăm sóc"
    });

    // JWT Bearer trong Swagger
    options.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT",
        In = ParameterLocation.Header,
        Description = "Nhập JWT token: Bearer {your token}"
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
// --- Đức Anh ---

// 1. Đăng ký Repositories (Data Access Logic)
builder.Services.AddScoped<ICategoryRepository, CategoryDARepository>();
// 2. Đăng ký Services (Business Logic)
builder.Services.AddScoped<ICategoryDAService, CategoryDAService>();
builder.Services.AddScoped<IFeedbackService, FeedbackService>(); //Cảnh
builder.Services.AddScoped<IEmailService, EmailService>(); //Cảnh
builder.Services.AddScoped<ICartService, CartService>(); //Cảnh
builder.Services.AddScoped<IOrderService, OrderService>(); //Cảnh
builder.Services.AddScoped<IUserDAService, UserDAService>();
builder.Services.AddScoped<IProductDAService, ProductDAService>();

// Register Services - Phần của Vinh
builder.Services.AddScoped<IUserPlantService, UserPlantService>();
builder.Services.AddScoped<ICareSuggestionService, CareSuggestionService>();

// JWT Authentication
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
        ClockSkew = TimeSpan.Zero
    };
});

// CORS
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

// Configure the HTTP request pipeline
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