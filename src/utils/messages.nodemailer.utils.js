const transporter = require('../helpers/nodemailer.helpers')


const registroExitoso = async (userEmail, userName) => {
  const info = await transporter.sendMail({
    from: `"FHIS&L - Fundacion Humanitaria Internacionl Sol&Luna" <${process.env.GMAIL_USER}>`,
    to: `${userEmail}`,
    subject: `Bienvenido/a ${userName} a esta gran familia`,
    text: "Gracias por tu registro", // plain‑text body
    html: htmlContent(userName), // HTML body
  });

  console.log("Message sent:", info);
}


const htmlContent = (userName) => `
  <div style="background-color:#e6f4ff; padding:20px; font-family: Arial, Helvetica, sans-serif; color:#333;">
    <div style="max-width:600px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 10px rgba(0,0,0,0.1);">
      
      <!-- Header -->
      <div style="background:linear-gradient(135deg, #4da6ff, #1e90ff); padding:20px; text-align:center; color:#fff;">
        <h1 style="margin:0; font-size:26px;">🌍 Bienvenido/a a la familia Sol & Luna</h1>
      </div>
      
      <!-- Body -->
      <div style="padding:30px; text-align:center;">
        <h2 style="margin-top:0; color:#1e90ff;">¡Hola ${userName}! 👋</h2>
        <p style="font-size:16px; line-height:1.6; color:#444;">
          Nos alegra mucho que te hayas unido a <b>Fundación Humanitaria Internacional Sol & Luna</b>.  
          A partir de hoy, formas parte de una gran familia que trabaja por la <b>unidad, el servicio y la esperanza</b>. ✨
        </p>
        <p style="font-size:15px; color:#555; margin:20px 0;">
          Aquí encontrarás proyectos, personas y oportunidades para crecer y servir juntos. 💙
        </p>

        <!-- Call to action -->
        <a href="http://localhost:5173/login" target="_blank" 
          style="display:inline-block; background:#1e90ff; color:#fff; padding:12px 25px; border-radius:8px; text-decoration:none; font-size:16px; font-weight:bold; margin-top:15px;">
          Conócenos mejor 🚀
        </a>
      </div>

      <!-- Footer -->
      <div style="background:#f0f8ff; padding:15px; text-align:center; font-size:13px; color:#666;">
        <p style="margin:0;">© 2025 Fundación Humanitaria Internacional Sol & Luna</p>
        <p style="margin:5px 0;">Este mensaje fue enviado automáticamente, por favor no respondas a este correo.</p>
      </div>
    </div>
  </div>
`;


module.exports = {
  registroExitoso
}