
// Helper to generate the Premium HTML Email
export const generateEmailHtml = (title: string, hotelName: string, content: string, wifiSsid?: string, wifiPass?: string) => {

    let wifiSection = "";
    if (wifiSsid && wifiPass) {
        const qrData = `WIFI:S:${wifiSsid};T:WPA;P:${wifiPass};;`;
        const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}`;

        wifiSection = `
        <div style="text-align: center; margin-top: 30px; border-top: 1px solid #333; padding-top: 25px;">
             <h3 style="color: #FFD700; display:flex; align-items:center; justify-content:center; gap:8px;">📶 Wi-Fi Access</h3>
             <div style="background: white; padding: 10px; display: inline-block; border-radius: 8px;">
                <img src="${qrUrl}" alt="WiFi QR Code" style="display: block;" />
             </div>
             <p style="color: #ccc; margin-top: 15px;">Network: <b style="color: #fff;">${wifiSsid}</b></p>
             <p style="color: #ccc;">Password: <b style="color: #fff;">${wifiPass}</b></p>
        </div>
        `;
    }

    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f4f4; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <div style="max-width: 600px; margin: 20px auto; background-color: #1a1a2e; color: #e0e0e0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
            
            <!-- Header -->
            <div style="padding: 40px 30px; text-align: center; background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%); border-bottom: 1px solid #333;">
                <h1 style="color: #fff; margin: 0; font-size: 24px; letter-spacing: 1px;">${title}</h1>
                <p style="color: #a0a0a0; margin: 10px 0 0;">${hotelName}</p>
            </div>

            <!-- Content -->
            <div style="padding: 30px;">
                ${content}
                ${wifiSection}
                
                <p style="margin-top: 40px; color: #a0a0a0; font-size: 14px;">Enjoy your stay!</p>
            </div>

            <!-- Footer -->
            <div style="background-color: #13131f; padding: 20px; text-align: center; color: #666; font-size: 12px; border-top: 1px solid #333;">
                <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ${hotelName}. All rights reserved.</p>
                <p style="margin: 0;">Experience Luxury & Comfort</p>
            </div>
        </div>
    </body>
    </html>
    `;
};
