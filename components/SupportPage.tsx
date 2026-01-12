import React, { useState } from 'react';
import { MessageCircle, Mail, Send, Phone, ExternalLink, CheckCircle2, Loader2, Headphones, HelpCircle, FileText } from 'lucide-react';

const translations = {
    th: {
        badge: "ศูนย์ช่วยเหลือ",
        titlePrefix: "ต้องการ",
        titleHighlight: "ความช่วยเหลือ?",
        subtitle: "เรายินดีช่วยเหลือ! เลือกวิธีติดต่อที่คุณสะดวกที่สุด",
        line: {
            title: "LINE OA",
            sub: "ตอบกลับเร็วที่สุด"
        },
        email: {
            title: "Email",
            sub: "ตอบภายใน 24 ชม."
        },
        facebook: {
            title: "Facebook",
            sub: "Inbox เลย!"
        },
        form: {
            title: "ส่งข้อความถึงเรา",
            subtitle: "กรอกฟอร์มด้านล่างเพื่อส่งคำถามหรือปัญหาของคุณ",
            nameLabel: "ชื่อ",
            namePlaceholder: "ชื่อของคุณ",
            emailLabel: "อีเมล",
            emailPlaceholder: "your@email.com",
            msgLabel: "ข้อความ",
            msgPlaceholder: "อธิบายปัญหาหรือคำถามของคุณ...",
            button: "ส่งข้อความ",
            sending: "กำลังส่ง...",
            sent: "ส่งข้อความสำเร็จ!"
        },
        faq: {
            api: {
                q: "วิธีใช้งาน API Key?",
                a: "ไปที่หน้า Settings และกรอก Gemini API Key ของคุณ คุณสามารถขอฟรีได้จาก Google AI Studio"
            },
            invoice: {
                q: "ต้องการ Invoice?",
                a: "ติดต่อทาง LINE OA แจ้งอีเมลที่ใช้สมัคร เราจะส่ง Invoice ให้ภายใน 1 วันทำการ"
            }
        }
    },
    en: {
        badge: "Support Center",
        titlePrefix: "Need",
        titleHighlight: "Help?",
        subtitle: "We're here to help! Choose the most convenient way to contact us.",
        line: {
            title: "LINE OA",
            sub: "Fastest Response"
        },
        email: {
            title: "Email",
            sub: "Reply within 24 hrs"
        },
        facebook: {
            title: "Facebook",
            sub: "Inbox Us!"
        },
        form: {
            title: "Send us a message",
            subtitle: "Fill out the form below to submit your question or issue.",
            nameLabel: "Name",
            namePlaceholder: "Your Name",
            emailLabel: "Email",
            emailPlaceholder: "your@email.com",
            msgLabel: "Message",
            msgPlaceholder: "Describe your issue or question...",
            button: "Send Message",
            sending: "Sending...",
            sent: "Message Sent!"
        },
        faq: {
            api: {
                q: "How to use API Key?",
                a: "Go to Settings page and enter your Gemini API Key. You can get it for free from Google AI Studio."
            },
            invoice: {
                q: "Need an Invoice?",
                a: "Contact us via LINE OA with your registered email. We will send the invoice within 1 business day."
            }
        }
    }
};

interface SupportPageProps {
    language?: 'Thai' | 'English';
}

const SupportPage: React.FC<SupportPageProps> = ({ language = 'English' }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const t = translations[language === 'Thai' ? 'th' : 'en'];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSending(true);

        // Simulate send (replace with real API call if needed)
        await new Promise(resolve => setTimeout(resolve, 1500));

        setSending(false);
        setSent(true);
        setName('');
        setEmail('');
        setMessage('');

        setTimeout(() => setSent(false), 5000);
    };

    return (
        <div className="max-w-5xl mx-auto px-4 py-8 animate-in fade-in zoom-in duration-500 font-kanit pb-32">
            <div className="mb-12 text-center">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200 rounded-full text-blue-600 text-xs font-bold uppercase tracking-widest mb-4">
                    <Headphones size={12} /> {t.badge}
                </div>
                <h1 className="text-4xl md:text-6xl font-black text-slate-900 mb-4 uppercase tracking-tight">
                    {t.titlePrefix} <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-cyan-600">{t.titleHighlight}</span>
                </h1>
                <p className="text-slate-500 text-lg max-w-2xl mx-auto font-medium">
                    {t.subtitle}
                </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-12">
                {/* Quick Contact Cards */}
                <a
                    href="https://line.me/R/ti/p/@lazycreator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200 rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-green-200"
                >
                    <div className="w-16 h-16 bg-green-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-green-100 transition-colors border border-green-100">
                        <MessageCircle size={32} className="text-green-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{t.line.title}</h3>
                    <p className="text-green-600 font-bold text-lg bg-green-50 inline-block px-3 py-1 rounded-lg">@lazycreator</p>
                    <p className="text-slate-400 text-sm mt-3 font-semibold uppercase tracking-wide">{t.line.sub}</p>
                </a>

                <a
                    href="mailto:support@lazycreator.com"
                    className="bg-white border border-slate-200 rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-blue-200"
                >
                    <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-blue-100 transition-colors border border-blue-100">
                        <Mail size={32} className="text-blue-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{t.email.title}</h3>
                    <p className="text-blue-600 font-bold text-lg bg-blue-50 inline-block px-3 py-1 rounded-lg">support@lazycreator.com</p>
                    <p className="text-slate-400 text-sm mt-3 font-semibold uppercase tracking-wide">{t.email.sub}</p>
                </a>

                <a
                    href="https://facebook.com/lazycreator"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-white border border-slate-200 rounded-3xl p-8 text-center hover:scale-105 transition-all duration-300 group shadow-sm hover:shadow-xl hover:border-indigo-200"
                >
                    <div className="w-16 h-16 bg-indigo-50 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-indigo-100 transition-colors border border-indigo-100">
                        <ExternalLink size={32} className="text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 mb-2">{t.facebook.title}</h3>
                    <p className="text-indigo-600 font-bold text-lg bg-indigo-50 inline-block px-3 py-1 rounded-lg">LazycCreator</p>
                    <p className="text-slate-400 text-sm mt-3 font-semibold uppercase tracking-wide">{t.facebook.sub}</p>
                </a>
            </div>

            {/* Contact Form */}
            <div className="bg-white border border-slate-200 rounded-[2.5rem] p-8 md:p-12 shadow-xl">
                <div className="flex items-center gap-4 mb-10 pb-8 border-b border-slate-100">
                    <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center border border-purple-100 text-purple-600 shadow-sm">
                        <Send size={26} />
                    </div>
                    <div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{t.form.title}</h3>
                        <p className="text-slate-500 font-medium">{t.form.subtitle}</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.form.nameLabel}</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all placeholder:text-slate-300"
                                placeholder={t.form.namePlaceholder}
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.form.emailLabel}</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all placeholder:text-slate-300"
                                placeholder={t.form.emailPlaceholder}
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-xs font-black text-slate-400 uppercase tracking-widest mb-2 ml-1">{t.form.msgLabel}</label>
                        <textarea
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            required
                            rows={5}
                            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-slate-900 font-bold focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all resize-none placeholder:text-slate-300"
                            placeholder={t.form.msgPlaceholder}
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={sending || sent}
                        className={`w-full py-4 rounded-xl font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-lg active:scale-95 ${sent
                            ? 'bg-emerald-500 text-white shadow-emerald-200'
                            : 'bg-slate-900 text-white hover:bg-slate-800 shadow-slate-200'
                            } disabled:opacity-70 disabled:active:scale-100`}
                    >
                        {sending ? (
                            <>
                                <Loader2 size={18} className="animate-spin" />
                                {t.form.sending}
                            </>
                        ) : sent ? (
                            <>
                                <CheckCircle2 size={18} />
                                {t.form.sent}
                            </>
                        ) : (
                            <>
                                <Send size={18} />
                                {t.form.button}
                            </>
                        )}
                    </button>
                </form>
            </div>

            {/* FAQ Section */}
            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-500 shrink-0">
                        <HelpCircle size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wide text-sm">{t.faq.api.q}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{t.faq.api.a}</p>
                    </div>
                </div>
                <div className="bg-white border border-slate-200 rounded-3xl p-8 flex items-start gap-5 shadow-sm hover:shadow-md transition-shadow">
                    <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 shrink-0">
                        <FileText size={20} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 mb-2 uppercase tracking-wide text-sm">{t.faq.invoice.q}</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed">{t.faq.invoice.a}</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SupportPage;
