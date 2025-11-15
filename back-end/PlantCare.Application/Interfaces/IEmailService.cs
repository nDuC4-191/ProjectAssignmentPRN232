using PlantCare.Application.DTOs.OrderDTO;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace PlantCare.Application.Interfaces
{

        public interface IEmailService
        {
            Task SendEmailAsync(string to, string subject, string htmlMessage);
            Task SendOrderConfirmationEmailAsync(string userEmail, OrderDTO order);
        

    }
}
