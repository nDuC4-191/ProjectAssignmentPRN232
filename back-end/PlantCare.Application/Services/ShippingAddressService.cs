using Microsoft.EntityFrameworkCore;
using PlantCare.Application.DTOs.ShippingAddress;
using PlantCare.Application.Interfaces;
using PlantCare.Infrastructure.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Services
{
    public class ShippingAddressService : IShippingAddressService
    {
        private readonly PlantCareContext _context;

        public ShippingAddressService(PlantCareContext context)
        {
            _context = context;
        }

        public async Task<List<AddressDTO>> GetUserAddressesAsync(int userId)
        {
            return await _context.UserAddresses
                .Where(x => x.UserId == userId)
                .Select(a => new AddressDTO
                {
                    AddressID = a.AddressId,
                    RecipientName = a.RecipientName,
                    Phone = a.Phone,
                    AddressLine = a.AddressLine,
                    IsDefault = a.IsDefault ?? false
                }).ToListAsync();
        }

        public async Task<AddressDTO?> GetAddressByIdAsync(int userId, int addressId)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

            if (address == null) return null;

            return new AddressDTO
            {
                AddressID = address.AddressId,
                RecipientName = address.RecipientName,
                Phone = address.Phone,
                AddressLine = address.AddressLine,
                IsDefault = address.IsDefault ?? false
            };
        }

        public async Task<int> CreateAddressAsync(int userId, AddressDTO dto)
        {
            var newAddress = new UserAddress
            {
                UserId = userId,
                RecipientName = dto.RecipientName,
                Phone = dto.Phone,
                AddressLine = dto.AddressLine,
                IsDefault = false
            };

            _context.UserAddresses.Add(newAddress);
            await _context.SaveChangesAsync();

            return newAddress.AddressId;
        }

        public async Task<bool> UpdateAddressAsync(int userId, int addressId, AddressDTO dto)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

            if (address == null) return false;

            address.RecipientName = dto.RecipientName;
            address.Phone = dto.Phone;
            address.AddressLine = dto.AddressLine;

            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> DeleteAddressAsync(int userId, int addressId)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

            if (address == null) return false;

            _context.UserAddresses.Remove(address);
            await _context.SaveChangesAsync();
            return true;
        }

        public async Task<bool> SetDefaultAddressAsync(int userId, int addressId)
        {
            var address = await _context.UserAddresses
                .FirstOrDefaultAsync(a => a.AddressId == addressId && a.UserId == userId);

            if (address == null) return false;

            var all = await _context.UserAddresses.Where(a => a.UserId == userId).ToListAsync();
            foreach (var a in all)
                a.IsDefault = false;

            address.IsDefault = true;

            await _context.SaveChangesAsync();
            return true;
        }
    }
}
