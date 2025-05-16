import React from 'react';

interface FooterLink {
  id: string;
  label: string;
  href: string;
}

interface FooterColumn {
  id: string;
  title: string;
  links: FooterLink[];
}

interface SocialLink {
  id: string;
  icon: string;
  href: string;
  label: string;
}

interface FooterProps {
  columns: FooterColumn[];
  copyrightText: string;
  socialLinks: SocialLink[];
}

export default function Footer({ columns, copyrightText, socialLinks }: FooterProps) {
  return (
    <footer className="bg-gray-900 text-white py-10 px-6">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-7xl mx-auto text-sm">
        {columns.map((column) => (
          <div key={column.id}>
            <h4 className="font-bold mb-2">{column.title}</h4>
            <ul className="space-y-1">
              {column.links.map((link) => (
                <li key={link.id}>
                  <a href={link.href} className="hover:text-gray-300 transition-colors">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-7xl mx-auto mt-8 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center">
        <div className="text-xs text-gray-400">{copyrightText}</div>
        <div className="flex space-x-4 mt-4 sm:mt-0">
          {socialLinks.map((social) => (
            <a
              key={social.id}
              href={social.href}
              className="text-gray-400 hover:text-white transition-colors"
              aria-label={social.label}
            >
              {social.icon}
            </a>
          ))}
        </div>
      </div>
    </footer>
  );
}
