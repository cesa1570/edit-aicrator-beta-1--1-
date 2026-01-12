import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Play, Check, ArrowRight, Video, Youtube, Sparkles, Star, ChevronDown, ChevronUp, Instagram, Facebook, User } from 'lucide-react';

interface LandingPageProps {
    onLogin: () => void;
    onRegister: () => void;
    language: 'Thai' | 'English';
    onToggleLanguage: () => void;
    user?: { email: string | null; photoURL?: string | null } | null;
    onEnterApp?: () => void;
}

const translations = {
    th: {
        nav: {
            features: "ฟีเจอร์",
            styles: "สไตล์ภาพ",
            howItWorks: "วิธีใช้งาน",
            pricing: "ราคา",
            login: "เข้าสู่ระบบ",
            startFree: "เริ่มต้นฟรี"
        },
        hero: {
            update: "ใหม่: รองรับ Gemini 2.0 AI",
            title: <>สร้างวิดีโอ Short ด้วยการคลิกครั้งเดียว <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">ด้วยพลัง AI</span></>,
            desc: "สร้างสคริปต์ ภาพ และเสียงพากย์ได้ในคลิกเดียว ดาวน์โหลดไฟล์วิดีโอคุณภาพสูงพร้อมนำไปใช้งานได้ทันที ไม่ต้องตัดต่อเอง",
            ctaPrimary: "เริ่มต้นใช้งานฟรี",
            ctaSecondary: "ดูตัวอย่างวิดีโอ",
            trusted: "ไว้วางใจโดยครีเอเตอร์กว่า 10,000 คน",
            videoCard: {
                title: "สร้างวิดีโอ Shorts อัตโนมัติด้วย AI 🚀 ไม่ต้องตัดต่อ #AI #Shorts #Automation",
                trending: "Following / For You"
            }
        },
        styles: {
            subtitle: "Visual Styles",
            title: "11 สไตล์ภาพสุดล้ำสำหรับทุกคอนเทนต์"
        },
        steps: {
            title: "ใช้งานง่าย 3 ขั้นตอน",
            subtitle: "สร้างคอนเทนต์คุณภาพสูงได้ในไม่กี่นาที",
            step1: { title: "เลือกหัวข้อ", desc: "เลือก Niche ที่คุณต้องการ หรือพิมพ์ Prompt เอง เพื่อให้ AI สร้างเนื้อหาที่โดนใจ" },
            step2: { title: "ปรับแต่งสไตล์", desc: "เลือกสไตล์ภาพและเสียงพากย์ที่ชอบ ปรับแต่งแบรนด์ของคุณได้ดั่งใจ" },
            step3: { title: "ดาวน์โหลดและแชร์", desc: "ระบบจะสร้างวิดีโอคุณภาพสูงให้คุณพร้อมดาวน์โหลด (.mp4) เพื่อนำไปอัปโหลดบน Platform ที่คุณต้องการ" }
        },
        pricing: {
            title: "ราคาแพคเกจ AI Creator",
            subtitle: "สมัครวันนี้ ล็อคราคาเดิมตลอดชีพ ไม่มีปรับขึ้น",
            month: "เดือน",
            save: "ประหยัด",
            bestValue: "คุ้มค่าที่สุด",
            cta: "เลือกแพ็กเกจนี้",
            discount: "ลด",
            features: {
                mobile: "**ไม่รองรับบนมือถือ***",
                shorts: "AI Short Creator: สร้างคลิปวิดีโอไวรัลจาก TOPIC ได้ไม่จำกัด",
                voice: "AI Voiceover: เสียงพากย์ AI ธรรมชาติ ภาษาไทย",
                watermark: "No Watermark: วิดีโอไม่มีลายน้ำ 100%",
                quality: "High Quality: ความละเอียดสูงสุด 1080p"
            },
            plans: {
                lite: { features: ["500 Credits / เดือน", "สร้าง Shorts ~50 คลิป", "ลบลายน้ำ", "เสียงพากย์พรีเมียม", "ใช้งานเชิงพาณิชย์"] },
                pro: { features: ["2,500 Credits / เดือน", "สร้าง Shorts ~250 คลิป", "ลบลายน้ำ", "เสียงพากย์พรีเมียม", "ใช้งานเชิงพาณิชย์"] },
                agency: { features: ["6,000 Credits / เดือน", "สร้าง Shorts ~600 คลิป", "ลบลายน้ำ", "เสียงพากย์พรีเมียม", "ใช้งานเชิงพาณิชย์"] }
            }
        },
        faq: {
            title: "คำถามที่พบบ่อย",
            items: [
                { q: "ระบบ Credits คิดยังไง?", a: "เราใช้ระบบ Credits ที่ยืดหยุ่น! การสร้างวิดีโอ Shorts 1 เรื่องใช้เพียง 10 Credits ส่วนวิดีโอยาวและโมเดล Wan 2.1 จะใช้ Credits ตามความซับซ้อนของงาน คุณสามารถดูรายละเอียดได้ก่อนกดสร้าง" },
                { q: "ใช้งานเชิงพาณิชย์ได้ไหม?", a: "ได้แน่นอน! แพ็กเกจ Pro และ Agency มาพร้อม Commercial License เต็มรูปแบบ คุณสามารถนำวิดีโอไปลง YouTube, TikTok, หรือขายงานลูกค้าได้ทันทีโดยไม่ต้องกังวลเรื่องลิขสิทธิ์" },
                { q: "เครดิตมีวันหมดอายุไหม?", a: "Credits จากแพ็กเกจรายเดือนจะรีเซ็ตทุกเดือน (Use it or lose it) เพื่อความคุ้มค่าสูงสุด ส่วน Credits ที่ซื้อเพิ่ม (Top-up) จะไม่มีวันหมดอายุ ตราบใดที่บัญชีของคุณยัง Active" },
                { q: "ยกเลิกได้ตลอดเวลาไหม?", a: "ได้ครับ! คุณสามารถยกเลิกการต่ออายุอัตโนมัติ (Subscription) ได้ตลอดเวลาผ่านหน้า Settings โดยไม่มีข้อผูกมัดใดๆ" },
            ]
        },
        footer: {
            desc: "เครื่องมือ AI สำหรับสร้างวิดีโอ Faceless อัตโนมัติ เริ่มต้นเส้นทาง Content Creator ของคุณวันนี้",
            products: "ผลิตภัณฑ์",
            legal: "กฎหมาย",
            terms: "ข้อกำหนดการใช้งาน",
            privacy: "นโยบายความเป็นส่วนตัว",
            copyright: "สงวนลิขสิทธิ์"
        }
    },
    en: {
        nav: {
            features: "Features",
            styles: "Art Styles",
            howItWorks: "How it Works",
            pricing: "Pricing",
            login: "Log In",
            startFree: "Start for Free"
        },
        hero: {
            update: "NEW: Gemini 2.0 AI Support",
            title: <>Create Viral Shorts in One Click <br /><span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">Powered by AI</span></>,
            desc: "Generate scripts, visuals, and voiceovers instantly. Download high-quality video files ready for upload. No editing required.",
            ctaPrimary: "Start for Free",
            ctaSecondary: "Watch Demo",
            trusted: "Trusted by 10,000+ Creators",
            videoCard: {
                title: "Automate Viral AI Shorts 🚀 No Editing Needed #AI #Shorts #Automation",
                trending: "Following / For You"
            }
        },
        styles: {
            subtitle: "Visual Styles",
            title: "11 Stunning Art Styles for Every Niche"
        },
        steps: {
            title: "3 Simple Steps",
            subtitle: "Create high-quality content in minutes",
            step1: { title: "Choose Topic", desc: "Select your niche or type a prompt to let AI generate engaging content." },
            step2: { title: "Customize Style", desc: "Pick your preferred visual style and voiceover to match your brand." },
            step3: { title: "Download & Share", desc: "Get high-quality video (.mp4) ready to upload to your favorite platforms." }
        },
        pricing: {
            title: "AI Creator Plans",
            subtitle: "Lock in this price forever. No future price hikes.",
            month: "Month",
            save: "Save",
            bestValue: "Best Value",
            cta: "Choose Plan",
            discount: "OFF",
            features: {
                mobile: "**Desktop Only***",
                shorts: "AI Short Creator: Unlimited Viral Shorts generation",
                voice: "AI Voiceover: Natural AI Voices (Thai & English)",
                watermark: "No Watermark: 100% Whitelabel",
                quality: "High Quality: Max 1080p Resolution"
            },
            plans: {
                lite: { features: ["500 Credits / Month", "Create ~50 Shorts", "Remove Watermark", "Premium Voices", "Commercial License"] },
                pro: { features: ["2,500 Credits / Month", "Create ~250 Shorts", "Remove Watermark", "Premium Voices", "Commercial License"] },
                agency: { features: ["6,000 Credits / Month", "Create ~600 Shorts", "Remove Watermark", "Premium Voices", "Commercial License"] }
            }
        },
        faq: {
            title: "Frequently Asked Questions",
            items: [
                { q: "How do Credits work?", a: "Our system is flexible! Generating one Short video uses just 10 Credits. Long videos and premium models like Wan 2.1 consume credits based on complexity. You'll always see the cost before generating." },
                { q: "Can I use videos commercially?", a: "Absolutely! Pro and Agency plans come with a full Commercial License. You can monetize on YouTube/TikTok or deliver work to clients worry-free." },
                { q: "Do credits expire?", a: "Monthly subscription credits reset every month (Use it or lose it) to give you the best rate. Top-up credits never expire as long as your account remains active." },
                { q: "Can I cancel anytime?", a: "Yes! You can cancel your subscription auto-renewal at any time from your Settings page with zero long-term commitment." },
            ]
        },
        footer: {
            desc: "#1 AI Tool for Automated Faceless Videos. Start your creator journey today.",
            products: "Products",
            legal: "Legal",
            terms: "Terms of Service",
            privacy: "Privacy Policy",
            copyright: "All Rights Reserved"
        }
    }
};

const LandingPage: React.FC<LandingPageProps> = ({ onLogin, onRegister, language, onToggleLanguage, user, onEnterApp }) => {
    const [openFaq, setOpenFaq] = useState<number | null>(null);
    const t = translations[language === 'Thai' ? 'th' : 'en'];

    const toggleFaq = (index: number) => {
        setOpenFaq(openFaq === index ? null : index);
    };

    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const scrollContainer = scrollRef.current;
        if (!scrollContainer) return;

        let animationId: number;
        let speed = 1.5; // Pixels per frame - increased for more visible movement
        let accumulatedScroll = 0;

        const scroll = () => {
            if (scrollContainer) {
                accumulatedScroll += speed;
                if (accumulatedScroll >= 1) {
                    scrollContainer.scrollLeft += 1;
                    accumulatedScroll = 0;

                    if (scrollContainer.scrollLeft + scrollContainer.clientWidth >= scrollContainer.scrollWidth - 1) {
                        scrollContainer.scrollLeft = 0;
                    }
                }
            }
            animationId = requestAnimationFrame(scroll);
        };

        const startScroll = () => {
            cancelAnimationFrame(animationId);
            animationId = requestAnimationFrame(scroll);
        };

        const stopScroll = () => {
            cancelAnimationFrame(animationId);
        };

        startScroll();

        scrollContainer.addEventListener('mouseenter', stopScroll);
        scrollContainer.addEventListener('mouseleave', startScroll);

        return () => {
            cancelAnimationFrame(animationId);
            if (scrollContainer) {
                scrollContainer.removeEventListener('mouseenter', stopScroll);
                scrollContainer.removeEventListener('mouseleave', startScroll);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-white text-slate-900 font-sans overflow-x-hidden selection:bg-indigo-100">
            {/* Navbar */}
            <nav className="sticky top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-100 h-20">
                <div className="container mx-auto px-6 h-full flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src="/images/logo_new.png" alt="AutoCreator Logo" className="w-12 h-12 rounded-xl shadow-md object-cover" />
                        <span className="text-xl font-bold tracking-tight text-slate-900">AutoCreator</span>
                    </div>

                    <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-600">
                        <a href="#features" className="hover:text-indigo-600 transition">Features</a>
                        <a href="#styles" className="hover:text-indigo-600 transition">Art Styles</a>
                        <a href="#how-it-works" className="hover:text-indigo-600 transition">How it Works</a>
                        <a href="#pricing" className="hover:text-indigo-600 transition">Pricing</a>
                    </div>
                    <div className="flex items-center gap-4">
                        {user ? (
                            /* Logged in: Show profile */
                            <button
                                onClick={onEnterApp}
                                className="flex items-center gap-3 px-4 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                            >
                                {user.photoURL ? (
                                    <img src={user.photoURL} alt="Profile" className="w-6 h-6 rounded-full object-cover" />
                                ) : (
                                    <div className="w-6 h-6 rounded-full bg-indigo-400 flex items-center justify-center">
                                        <User size={14} className="text-white" />
                                    </div>
                                )}
                                <span className="hidden sm:inline">Enter App</span>
                                <ArrowRight size={16} />
                            </button>
                        ) : (
                            /* Not logged in: Show login/register */
                            <>
                                <button
                                    onClick={onLogin}
                                    className="text-sm font-bold text-slate-600 hover:text-indigo-600 transition"
                                >
                                    Log In
                                </button>
                                <button
                                    onClick={onRegister}
                                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 transition shadow-lg shadow-indigo-200"
                                >
                                    Start for Free
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-32 pb-20 lg:pt-40 lg:pb-32 px-6">
                <div className="container mx-auto grid lg:grid-cols-2 gap-12 items-center">
                    <div className="text-center lg:text-left">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-xs font-bold uppercase tracking-wider mb-6">
                            <Sparkles size={14} />
                            <span>{t.hero.update}</span>
                        </div>

                        <h1 className="text-4xl lg:text-6xl font-extrabold tracking-tight mb-6 text-slate-900 leading-[1.2]">
                            {t.hero.title}
                        </h1>

                        <p className="text-lg text-slate-500 mb-8 max-w-lg mx-auto lg:mx-0 leading-relaxed">
                            {t.hero.desc}
                        </p>

                        <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                            <button
                                onClick={onRegister}
                                className="px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-lg shadow-xl shadow-indigo-200 transition transform hover:-translate-y-1"
                            >
                                {t.hero.ctaPrimary}
                            </button>
                            <button className="px-8 py-4 bg-white border border-slate-200 text-slate-700 hover:border-indigo-200 hover:text-indigo-600 rounded-xl font-bold text-lg transition flex items-center justify-center gap-2">
                                <Play size={20} className="fill-current" />
                                {t.hero.ctaSecondary}
                            </button>
                        </div>

                        <div className="mt-8 flex items-center justify-center lg:justify-start gap-4 text-sm text-slate-500 font-medium">
                            <div className="flex -space-x-2">
                                {[1, 2, 3, 4].map(i => (
                                    <div key={i} className={`w-8 h-8 rounded-full border-2 border-white bg-slate-200 flex items-center justify-center text-[10px] first:bg-indigo-100 last:bg-purple-100`}></div>
                                ))}
                            </div>
                            <p>{t.hero.trusted}</p>
                        </div>
                    </div>

                    {/* Hero Visual */}
                    <div className="relative mx-auto w-full max-w-[320px] lg:max-w-[360px]">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-gradient-to-tr from-indigo-100 to-purple-100 rounded-full blur-3xl -z-10"></div>
                        <div className="relative bg-slate-950 border-[8px] border-slate-900 rounded-[2.5rem] shadow-2xl overflow-hidden aspect-[9/16] ring-1 ring-white/10">
                            {/* Screen Content - Video Player UI */}
                            <div className="h-full w-full relative">
                                {/* Video/Thumbnail */}
                                <img
                                    src="/images/cinematic.jpeg"
                                    alt="AI Generated Video"
                                    className="absolute inset-0 w-full h-full object-cover opacity-90"
                                />
                                <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/60"></div>

                                {/* UI Overlay */}
                                <div className="absolute top-6 left-0 right-0 flex justify-center gap-4 text-sm font-bold text-white/90 shadow-black drop-shadow-md">
                                    <span className="opacity-50">Following</span>
                                    <span className="border-b-2 border-white pb-1">For You</span>
                                </div>

                                {/* Right Side Actions */}
                                <div className="absolute bottom-20 right-4 flex flex-col gap-6 items-center text-white">
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-slate-700/50 transition cursor-pointer">
                                            <div className="w-5 h-5 bg-pink-500 rounded-full animate-pulse"></div>
                                        </div>
                                        <span className="text-xs font-bold">8.5K</span>
                                    </div>
                                    <div className="flex flex-col items-center gap-1">
                                        <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-slate-700/50 transition cursor-pointer">
                                            <div className="w-5 h-5 bg-white rounded-full"></div>
                                        </div>
                                        <span className="text-xs font-bold">124</span>
                                    </div>
                                    <div className="w-10 h-10 bg-slate-800/50 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-slate-700/50 transition cursor-pointer">
                                        <div className="w-5 h-5 bg-white/80 rounded-sm"></div>
                                    </div>
                                </div>

                                {/* Bottom Info */}
                                <div className="absolute bottom-6 left-4 right-16 text-white text-left">
                                    <h3 className="font-bold text-sm mb-2 flex items-center gap-2">
                                        @AutoCreator_Official
                                        <div className="w-4 h-4 bg-blue-500 rounded-full flex items-center justify-center text-[10px]">✓</div>
                                    </h3>
                                    <p className="text-xs leading-relaxed opacity-90 line-clamp-2">
                                        {t.hero.videoCard.title}
                                    </p>
                                    <div className="mt-3 flex items-center gap-2 opacity-80">
                                        <div className="w-3 h-3 bg-white rounded-full animate-spin-slow"></div>
                                        <span className="text-[10px] scrolling-text">Original Sound - AutoCreator AI Music</span>
                                    </div>
                                </div>

                                {/* Play Button Overlay */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border border-white/30 animate-pulse">
                                        <Play size={24} className="ml-1 text-white fill-current" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Visual Styles Section */}
            <section id="styles" className="py-20 bg-slate-950 text-white overflow-hidden">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-12">
                        <span className="text-indigo-400 font-bold tracking-widest uppercase text-sm">{t.styles.subtitle}</span>
                        <h2 className="text-3xl lg:text-4xl font-black mt-2">{t.styles.title}</h2>
                    </div>

                    <div ref={scrollRef} className="flex overflow-x-auto pb-8 gap-6 snap-x scrollbar-hide">
                        <StyleCard
                            img="/images/cinematic.jpeg"
                            title="Cinematic Master"
                            tag="High-End"
                        />
                        <StyleCard
                            img="/images/anime.jpeg"
                            title="Neo Anime"
                            tag="Vibrant"
                        />
                        <StyleCard
                            img="/images/cyberpunk.jpg"
                            title="Cyberpunk Edgy"
                            tag="Sci-Fi"
                        />
                        <StyleCard
                            img="/images/horror.jpeg"
                            title="Atmospheric Horror"
                            tag="Dark"
                        />
                        <StyleCard
                            img="/images/nature.jpg"
                            title="NatGeo Reality"
                            tag="Realistic"
                        />
                        <StyleCard
                            img="/images/unreal.png"
                            title="Unreal Engine 5"
                            tag="Hyper-Realistic"
                        />
                        <StyleCard
                            img="/images/lego.jpeg"
                            title="Brick Animation"
                            tag="Playful"
                        />
                        <StyleCard
                            img="/images/disney.jpg"
                            title="Pixar Magic"
                            tag="Magical"
                        />
                        <StyleCard
                            img="/images/marvel.jpg"
                            title="Marvel Comic"
                            tag="Bold Ink"
                        />
                        <StyleCard
                            img="/images/manga.jpg"
                            title="Classic Manga"
                            tag="Black & White"
                        />
                        <StyleCard
                            img="/images/junji.jpg"
                            title="Horror Manga"
                            tag="Junji Ito"
                        />
                    </div>
                </div>
            </section>

            {/* Step Section (Removed Auto Pilot) */}
            <section id="how-it-works" className="py-24 bg-white">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-20">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">{t.steps.title}</h2>
                        <p className="text-lg text-slate-500">{t.steps.subtitle}</p>
                    </div>

                    <div className="grid md:grid-cols-3 gap-8">
                        <StepCard
                            num="01"
                            title={t.steps.step1.title}
                            desc={t.steps.step1.desc}
                            img="/images/step1.png"
                            color="bg-indigo-50 text-indigo-600"
                        />
                        <StepCard
                            num="02"
                            title={t.steps.step2.title}
                            desc={t.steps.step2.desc}
                            img="/images/step2.png"
                            color="bg-purple-50 text-purple-600"
                        />
                        <StepCard
                            num="03"
                            title={t.steps.step3.title}
                            desc={t.steps.step3.desc}
                            img="/images/step3.jpg"
                            color="bg-blue-50 text-blue-600"
                        />
                    </div>
                </div>
            </section>

            {/* Pricing Section */}
            <section id="pricing" className="py-24 bg-slate-50 border-t border-slate-100">
                <div className="container mx-auto px-6">
                    <div className="text-center max-w-2xl mx-auto mb-16">
                        <h2 className="text-3xl lg:text-4xl font-extrabold text-slate-900 mb-4">AI Creator Plans</h2>
                        <p className="text-lg text-slate-500">Lock in this price forever. No future price hikes.</p>
                    </div>

                    <div className="grid md:grid-cols-2 xl:grid-cols-4 gap-6 max-w-7xl mx-auto">
                        {/* STARTER */}
                        <PricingCard
                            title="STARTER"
                            price="9"
                            period="/mo"
                            tokens="100"
                            features={[
                                "100 Credits / Month",
                                "Create ~10 Shorts",
                                "Shorts Only (No Long Form)",
                                "No Watermark",
                                "Standard AI Voices",
                                "720p HD Export"
                            ]}
                            cta="Choose Plan"
                            onClick={onRegister}
                            isPopular={false}
                        />

                        {/* PRO */}
                        <PricingCard
                            title="PRO"
                            price="25"
                            period="/mo"
                            tokens="350"
                            features={[
                                "350 Credits / Month",
                                "Create ~35 Shorts",
                                "Unlock Long Form Video",
                                "No Watermark",
                                "Ultra-Realistic AI Voices",
                                "1080p Full HD Export"
                            ]}
                            cta="Choose Plan"
                            onClick={onRegister}
                            isPopular={true}
                            bestValueLabel="MOST POPULAR"
                        />

                        {/* PRO MAX */}
                        <PricingCard
                            title="PRO MAX"
                            price="49"
                            period="/mo"
                            tokens="800"
                            features={[
                                "800 Credits / Month",
                                "Create ~80 Shorts",
                                "Unlock Long Form Video",
                                "No Watermark",
                                "Premium AI Voices + Clones",
                                "4K Ultra HD Export"
                            ]}
                            cta="Choose Plan"
                            onClick={onRegister}
                            isPopular={false}
                        />

                        {/* ULTRA */}
                        <PricingCard
                            title="ULTRA"
                            price="99"
                            period="/mo"
                            tokens="2,000"
                            features={[
                                "2,000 Credits / Month",
                                "Create ~200 Shorts",
                                "Unlimited Auto-Posting",
                                "Unlock Long Form Video",
                                "Long-form & UGC Video",
                                "Dedicated Account Manager"
                            ]}
                            cta="Choose Plan"
                            onClick={onRegister}
                            isPopular={false}
                            tokensLabel="Production Tier"
                        />
                    </div>
                </div>
            </section>

            {/* FAQ Section */}
            <section className="py-24 bg-white border-t border-slate-100">
                <div className="container mx-auto px-6 max-w-3xl">
                    <h2 className="text-3xl font-bold text-center mb-12 text-slate-900">{t.faq.title}</h2>
                    <div className="space-y-4">
                        {t.faq.items.map((item, i) => (
                            <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                                <button
                                    onClick={() => toggleFaq(i)}
                                    className="w-full flex items-center justify-between p-6 text-left font-bold text-slate-900 hover:bg-slate-50 transition"
                                >
                                    {item.q}
                                    {openFaq === i ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
                                </button>
                                {openFaq === i && (
                                    <div className="p-6 pt-0 text-slate-600 leading-relaxed bg-slate-50 border-t border-slate-100">
                                        {item.a}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 bg-slate-900 text-slate-400 text-sm">
                <div className="container mx-auto px-6">
                    <div className="grid md:grid-cols-4 gap-8 mb-12">
                        <div className="col-span-1 md:col-span-2">
                            <div className="flex items-center gap-2 text-white mb-4">
                                <Zap size={20} fill="currentColor" className="text-indigo-500" />
                                <span className="font-bold text-lg">AutoCreator</span>
                            </div>
                            <p className="max-w-xs leading-relaxed">
                                {t.footer.desc}
                            </p>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">{t.footer.products}</h4>
                            <ul className="space-y-2">
                                <li><a href="#" className="hover:text-indigo-400 transition">{t.nav.features}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition">{t.nav.pricing}</a></li>
                                <li><a href="#" className="hover:text-indigo-400 transition">{t.nav.howItWorks}</a></li>
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-bold text-white mb-4 uppercase tracking-wider text-xs">{t.footer.legal}</h4>
                            <ul className="space-y-2">
                                <li><Link to="/terms" className="hover:text-indigo-400 transition">{t.footer.terms}</Link></li>
                                <li><Link to="/privacy" className="hover:text-indigo-400 transition">{t.footer.privacy}</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="border-t border-slate-800 pt-8 flex flex-col md:flex-row items-center justify-between">
                        <p>© 2026 AutoCreator Inc. {t.footer.copyright}</p>
                        <div className="flex gap-4 mt-4 md:mt-0">
                            <Instagram size={20} className="hover:text-white cursor-pointer transition" />
                            <Youtube size={20} className="hover:text-white cursor-pointer transition" />
                            <Facebook size={20} className="hover:text-white cursor-pointer transition" />
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const StyleCard = ({ img, title, desc, tag }: any) => (
    <div className="min-w-[380px] w-[380px] bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 group hover:border-indigo-500/50 transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-900/20 snap-center">
        <div className="relative h-[520px] overflow-hidden">
            <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-black/60 to-transparent z-10"></div>
            <div className="absolute bottom-0 inset-x-0 h-2/3 bg-gradient-to-t from-black via-black/80 to-transparent z-10"></div>
            <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />

            <div className="absolute top-5 left-5 z-20">
                <span className="px-4 py-1.5 bg-white/10 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-widest border border-white/10">
                    {tag}
                </span>
            </div>

            <div className="absolute bottom-0 left-0 right-0 p-8 z-20">
                <h3 className="text-2xl font-black text-white mb-2 leading-tight">{title}</h3>
                <p className="text-base text-slate-400 leading-relaxed line-clamp-2">{desc}</p>
            </div>
        </div>
    </div>
);

const StepCard = ({ num, title, desc, img, color }: any) => (
    <div className="bg-white rounded-3xl overflow-hidden border border-slate-200 hover:shadow-xl transition duration-300 hover:-translate-y-1 flex flex-col h-full group">
        <div className="relative h-48 overflow-hidden bg-slate-100">
            <div className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/90 backdrop-blur font-black text-indigo-600 flex items-center justify-center shadow-sm z-10">
                {num}
            </div>
            <img src={img} alt={title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-60"></div>
        </div>
        <div className="p-8 text-center flex-1 flex flex-col">
            <h3 className="text-xl font-bold text-slate-900 mb-4">{title}</h3>
            <p className="text-slate-600 leading-relaxed text-sm">{desc}</p>
        </div>
    </div>
);

const PricingCard = ({ title, price, period, originalPrice, discount, save, features, cta, onClick, isPopular, bestValueLabel, tokens, ...props }: any) => (
    <div className={`p-6 rounded-3xl border relative flex flex-col h-full transition-all duration-300 ${isPopular ? 'border-indigo-600 bg-slate-900 text-white shadow-2xl scale-105 z-10' : 'border-slate-200 bg-white text-slate-900 hover:border-indigo-300 hover:shadow-xl hover:-translate-y-1'}`}>
        {isPopular && (
            <div className="absolute top-0 right-0 bg-indigo-600 text-white text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-2xl shadow-sm uppercase tracking-wider">
                {bestValueLabel || 'Best Value'}
            </div>
        )}

        <h3 className="text-xl font-bold mb-4">{title}</h3>

        <div className="mb-6">
            <div className="flex items-baseline gap-1">
                <span className={`text-4xl font-black ${isPopular ? 'text-indigo-400' : 'text-slate-900'}`}>${price}</span>
                <span className={`text-sm font-medium ${isPopular ? 'text-slate-400' : 'text-slate-500'}`}>{period}</span>
            </div>

            {tokens && (
                <div className={`mt-3 inline-flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider ${isPopular ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' : 'bg-slate-100 text-slate-600 border border-slate-200'}`}>
                    <Zap size={12} className="fill-current" />
                    {tokens} Tokens
                </div>
            )}

            {save && (
                <div className={`inline-block mt-2 px-3 py-1 text-xs font-bold rounded-lg border ${isPopular ? 'bg-green-900/30 text-green-400 border-green-800/50' : 'bg-green-50 text-green-700 border-green-200'}`}>
                    🎉 {save}
                </div>
            )}
        </div>

        <ul className="space-y-4 mb-8 flex-1">
            {features.map((f: string, i: number) => (
                <li key={i} className={`flex items-start gap-3 text-xs leading-relaxed ${isPopular ? 'text-slate-300' : 'text-slate-600'}`}>
                    <Check size={14} className={`min-w-[14px] mt-0.5 ${isPopular ? 'text-indigo-400' : 'text-indigo-600'}`} />
                    <span className={f.includes('ไม่รองรับบนมือถือ') ? 'text-red-500 font-bold' : ''}>
                        {f.replace(/\*\*/g, '').replace(/\*\*\*/g, '')}
                    </span>
                </li>
            ))}
        </ul>

        <button
            onClick={onClick}
            className={`w-full py-3 rounded-xl font-bold text-sm transition transform hover:-translate-y-1 shadow-lg ${isPopular
                ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-900/50'
                : 'bg-indigo-50 hover:bg-indigo-100 text-indigo-700 shadow-indigo-100'}`}
        >
            {cta}
        </button>
    </div>
);

export default LandingPage;
