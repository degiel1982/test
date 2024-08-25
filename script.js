let orderList = [];

// Parse the JSON data from the script tag
const emailConfigElement = document.getElementById('email-config');
const emailConfig = JSON.parse(emailConfigElement.textContent);

document.getElementById('toggleButton').addEventListener('click', function() {
    const qrFormContainer = document.getElementById('qrFormContainer');
    const orderSection = document.getElementById('orderSection');

    if (qrFormContainer.style.display === 'none') {
        qrFormContainer.style.display = 'block';
        orderSection.style.display = 'none';
        this.textContent = 'Show Order Section';
    } else {
        qrFormContainer.style.display = 'none';
        orderSection.style.display = 'block';
        this.textContent = 'Show QR Code Generator';
    }
});

// QR Code Generator
document.getElementById('qrForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const item_id = document.getElementById('item_id').value;
    const supplier = document.getElementById('supplier').value;
    const item_name = document.getElementById('item_name').value || 'No name';

    // Create JSON object
    const qrData = {
        item_id: item_id,
        supplier: supplier,
        item_name: item_name
    };

    // Convert JSON to string
    const qrString = JSON.stringify(qrData);

    // Generate the QR code using QRCode.js
    document.getElementById('qrcode').innerHTML = ""; // Clear any previous QR code
    new QRCode(document.getElementById("qrcode"), {
        text: qrString,
        width: 250,
        height: 250
    });
});

// Function to add item to order
function addItemToOrder() {
    const jsonInput = document.getElementById('jsonInput').value;
    const quantity = document.getElementById('quantity').value;

    try {
        const qrData = JSON.parse(jsonInput);
        qrData.quantity = quantity;
        orderList.push(qrData);
        displayOrderList();
    } catch (error) {
        alert('Invalid JSON data. Please check the input and try again.');
    }

    // Clear the input fields
    document.getElementById('jsonInput').value = '';
    document.getElementById('quantity').value = 1;
}

// Function to display the current order list as a table
function displayOrderList() {
    if (orderList.length === 0) {
        document.getElementById('orderList').innerHTML = '<p>No items in the order.</p>';
        return;
    }

    let orderListHtml = '<h2>Current Order</h2>';
    orderListHtml += `
        <table>
            <thead>
                <tr>
                    <th>Item Name</th>
                    <th>Item ID</th>
                    <th>Quantity</th>
                    <th>Supplier</th>
                </tr>
            </thead>
            <tbody>
    `;

    orderList.forEach((item, index) => {
        orderListHtml += `
            <tr>
                <td>${item.item_name}</td>
                <td>${item.item_id}</td>
                <td>${item.quantity}</td>
                <td>${item.supplier}</td>
            </tr>
        `;
    });

    orderListHtml += `
            </tbody>
        </table>
    `;

    document.getElementById('orderList').innerHTML = orderListHtml;
}

// Function to sort the order by supplier and send it via email
function sendOrder() {
    if (orderList.length === 0) {
        alert('No items in the order.');
        return;
    }

    if (!emailConfig || !emailConfig.to || !emailConfig.cc) {
        alert('Email configuration not loaded.');
        return;
    }

    // Sort the order by supplier
    orderList.sort((a, b) => a.supplier.localeCompare(b.supplier));

    let emailBody = 'Order List:\n\n';
    let currentSupplier = '';
    orderList.forEach(item => {
        if (item.supplier !== currentSupplier) {
            if (currentSupplier !== '') {
                emailBody += '\n'; // Add an extra newline before starting a new supplier section
            }
            currentSupplier = item.supplier;
            emailBody += `Supplier: ${currentSupplier}\n------------------------\n`;
        }
        emailBody += `Item: ${item.item_name}\n`;
        emailBody += `Item ID: ${item.item_id}\n`;
        emailBody += `Quantity: ${item.quantity}\n\n`;
    });

    // Get the current date
    const date = new Date().toLocaleDateString('en-GB'); // Format: DD/MM/YYYY

    // Encode email content, including new lines
    const encodedBody = encodeURIComponent(emailBody).replace(/%20/g, ' ').replace(/%0A/g, '%0D%0A');
    const encodedSubject = encodeURIComponent(`Order for ${date}`).replace(/%20/g, ' ');

    // Build the mailto link
    const toEmail = encodeURIComponent(emailConfig.to);
    const ccEmails = emailConfig.cc.map(encodeURIComponent).join(',');
    const mailtoLink = `mailto:${toEmail}?cc=${ccEmails}&subject=${encodedSubject}&body=${encodedBody}`;
    
    // Debug: Log the mailto link
    console.log(mailtoLink);

    // Uncomment to enable redirection
    window.location.href = mailtoLink;
}

