using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.UserDADTO;
using PlantCare.Application.Interfaces;

namespace PlantCare.API.Controllers
{
    [ApiController]
    [Route("api/admin/users")]
    public class AdminUsersController : Controller
    {

        private readonly IUserDAService _userService;

        public AdminUsersController(IUserDAService userService)
        {
            _userService = userService;
        }

        // GET: api/admin/users
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var users = await _userService.GetAllAsync();
            return Ok(users);
        }

        // GET: api/admin/users/5
        [HttpGet("{id}")]
        public async Task<IActionResult> Get(int id)
        {
            var user = await _userService.GetByIdAsync(id);
            if (user == null) return NotFound();
            return Ok(user);
        }

        // PUT: api/admin/users/{id}/role
        [HttpPut("{id}/role")]
        public async Task<IActionResult> UpdateRole(int id, [FromBody] UpdateUserDARoleDto dto)
        {
            var success = await _userService.UpdateRoleAsync(id, dto.Role);
            if (!success) return NotFound();
            return NoContent();
        }

        // PUT: api/admin/users/{id}/active?isActive=true
        [HttpPut("{id}/active")]
        public async Task<IActionResult> SetActive(int id, [FromQuery] bool isActive)
        {
            var success = await _userService.SetActiveAsync(id, isActive);
            if (!success) return NotFound();
            return NoContent();
        }
    }
}
