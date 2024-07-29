// const generateInvoiceNumber = () => {
//     const timestamp = new Date().getTime().toString(); // Current timestamp
//     const randomPart = Math.random().toString(36).substr(2, 5).toUpperCase()
//     return `INV-${timestamp}-${randomPart}`;
//   };
  
//   module.exports = generateInvoiceNumber;
  
const generateInvoiceNumber = () => {
    const randomPart = Math.floor(1000 + Math.random() * 9000)
    console.log(randomPart)
    return randomPart.toString();
  };
  
  module.exports = generateInvoiceNumber;
  