using PlantCare.Application.DTOs.ShippingAddress;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{
    public interface IShippingAddressService
    {
        Task<List<AddressDTO>> GetUserAddressesAsync(int userId);
        Task<AddressDTO?> GetAddressByIdAsync(int userId, int addressId);
        Task<int> CreateAddressAsync(int userId, AddressDTO dto);
        Task<bool> UpdateAddressAsync(int userId, int addressId, AddressDTO dto);
        Task<bool> DeleteAddressAsync(int userId, int addressId);
        Task<bool> SetDefaultAddressAsync(int userId, int addressId);
    }
}
