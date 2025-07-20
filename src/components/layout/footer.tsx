import Link from 'next/link';
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  Heart
} from 'lucide-react';

const footerLinks = {
  platform: {
    title: 'Platform',
    links: [
      { name: 'Ana Sayfa', href: '/' },
      { name: 'Forum', href: '/forum' },
      { name: 'Topluluk', href: '/community' },
      { name: 'Etkinlikler', href: '/events' },
      { name: 'Eğitim', href: '/education' },
    ]
  },
  features: {
    title: 'Özellikler',
    links: [
      { name: 'Gamifikasyon', href: '/features/gamification' },
      { name: 'Fotoğraf Yarışmaları', href: '/contests' },
      { name: 'Çalışma Grupları', href: '/study-groups' },
      { name: 'Günlük Anketler', href: '/polls' },
      { name: 'Mobil Uygulama', href: '/mobile' },
    ]
  },
  support: {
    title: 'Destek',
    links: [
      { name: 'Yardım Merkezi', href: '/help' },
      { name: 'İletişim', href: '/contact' },
      { name: 'Geri Bildirim', href: '/feedback' },
      { name: 'Hata Bildir', href: '/report-bug' },
      { name: 'Özellik İste', href: '/feature-request' },
    ]
  },
  legal: {
    title: 'Yasal',
    links: [
      { name: 'Gizlilik Politikası', href: '/privacy' },
      { name: 'Kullanım Şartları', href: '/terms' },
      { name: 'Çerez Politikası', href: '/cookies' },
      { name: 'Topluluk Kuralları', href: '/community-guidelines' },
      { name: 'Telif Hakkı', href: '/copyright' },
    ]
  }
};

const socialLinks = [
  { name: 'Facebook', href: '#', icon: Facebook },
  { name: 'Twitter', href: '#', icon: Twitter },
  { name: 'Instagram', href: '#', icon: Instagram },
  { name: 'YouTube', href: '#', icon: Youtube },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-gray-900 text-white">
      {/* Main Footer */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          {/* Brand Section */}
          <div className="lg:col-span-2">
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-primary">
                <span className="text-lg font-bold text-white">LF</span>
              </div>
              <span className="text-xl font-bold">Lise Forumu</span>
            </div>
            <p className="text-gray-400 mb-6 max-w-md">
              Türkiye'nin en büyük lise öğrencileri topluluğu. Arkadaşlık kur, 
              ders yardımı al, eğlenceli içerikleri keşfet.
            </p>
            
            {/* Contact Info */}
            <div className="space-y-2 text-sm text-gray-400">
              <div className="flex items-center">
                <Mail className="h-4 w-4 mr-2" />
                <a href="mailto:info@liseforumu.com" className="hover:text-white transition-colors">
                  info@liseforumu.com
                </a>
              </div>
              <div className="flex items-center">
                <Phone className="h-4 w-4 mr-2" />
                <a href="tel:+905551234567" className="hover:text-white transition-colors">
                  +90 555 123 45 67
                </a>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-2" />
                <span>İstanbul, Türkiye</span>
              </div>
            </div>
          </div>

          {/* Links Sections */}
          {Object.entries(footerLinks).map(([key, section]) => (
            <div key={key}>
              <h3 className="text-lg font-semibold mb-4">{section.title}</h3>
              <ul className="space-y-2">
                {section.links.map((link) => (
                  <li key={link.name}>
                    <Link 
                      href={link.href}
                      className="text-gray-400 hover:text-white transition-colors text-sm"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Newsletter Section */}
        <div className="border-t border-gray-800 mt-12 pt-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
            <div>
              <h3 className="text-lg font-semibold mb-2">
                Güncellemelerden Haberdar Ol
              </h3>
              <p className="text-gray-400 text-sm">
                Yeni özellikler, etkinlikler ve duyurular için e-posta listemize katıl.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="E-posta adresin"
                className="flex-1 px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
              />
              <button className="px-6 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded-lg font-medium transition-colors whitespace-nowrap">
                Abone Ol
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Footer */}
      <div className="border-t border-gray-800">
        <div className="container mx-auto px-4 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* Copyright */}
            <div className="flex items-center text-sm text-gray-400">
              <span>© {currentYear} Lise Forumu. Tüm hakları saklıdır.</span>
              <Heart className="h-4 w-4 mx-2 text-red-500" />
              <span>Türkiye'de yapıldı</span>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-400 mr-2">Takip Et:</span>
              {socialLinks.map((social) => {
                const Icon = social.icon;
                return (
                  <a
                    key={social.name}
                    href={social.href}
                    className="text-gray-400 hover:text-white transition-colors"
                    aria-label={social.name}
                  >
                    <Icon className="h-5 w-5" />
                  </a>
                );
              })}
            </div>
          </div>

          {/* Additional Info */}
          <div className="mt-4 pt-4 border-t border-gray-800 text-center">
            <p className="text-xs text-gray-500">
              Bu platform lise öğrencileri için tasarlanmıştır. 
              Güvenli ve moderasyonlu bir ortam sağlamak için sürekli çalışıyoruz.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}