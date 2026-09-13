import React from "react";
import { FacebookIcon, InstagramIcon, LinkedInIcon, YouTubeIcon } from "../Icons";
import Logo from "../Logo";

const social = [
  { icon: FacebookIcon, label: "Facebook" },
  { icon: InstagramIcon, label: "Instagram" },
  { icon: LinkedInIcon, label: "LinkedIn" },
  { icon: YouTubeIcon, label: "Youtube" },
];

const FooterComponent = () => (
  <footer className="site-footer">
    <div className="container">
      <div className="footer-social">
        <p>Síguenos</p>
        {social.map((item) => (
          <span key={item.label} className="social-item">
            <item.icon />
            {item.label}
          </span>
        ))}
      </div>
      <div className="site-footer__inner">
        <Logo />
        <div>
          <p>Orientación médica inicial. No reemplaza una cita presencial ni una emergencia.</p>
          <small>© {new Date().getFullYear()} Clínica Virtual. Todos los derechos reservados.</small>
        </div>
      </div>
    </div>
  </footer>
);

export default FooterComponent;
