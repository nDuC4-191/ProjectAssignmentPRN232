using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using PlantCare.Application.DTOs.ShippingAddress;
using PlantCare.Application.Interfaces;
using System.Security.Claims;

namespace PlantCare.API.Controllers
{

    [Route("api/[controller]")]
    [ApiController]
    [Authorize]
    public class ShippingAddressController : ControllerBase
    {
        private readonly IShippingAddressService _service;

        public ShippingAddressController(IShippingAddressService service)
        {
            _service = service;
        }

        private int GetUserId() =>
            int.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier));

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            return Ok(await _service.GetUserAddressesAsync(GetUserId()));
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _service.GetAddressByIdAsync(GetUserId(), id);
            return result == null ? NotFound() : Ok(result);
        }

        [HttpPost]
        public async Task<IActionResult> Create(AddressDTO dto)
        {
            var id = await _service.CreateAddressAsync(GetUserId(), dto);
            return Ok(new { AddressID = id });
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> Update(int id, AddressDTO dto)
        {
            return await _service.UpdateAddressAsync(GetUserId(), id, dto)
                ? Ok("Updated")
                : NotFound();
        }

        [HttpDelete("{id}")]
        public async Task<IActionResult> Delete(int id)
        {
            return await _service.DeleteAddressAsync(GetUserId(), id)
                ? Ok("Deleted")
                : NotFound();
        }

        [HttpPut("{id}/set-defaultaddress")]
        public async Task<IActionResult> SetDefault(int id)
        {
            return await _service.SetDefaultAddressAsync(GetUserId(), id)
                ? Ok("Default address updated")
                : NotFound();
        }
    }
}
