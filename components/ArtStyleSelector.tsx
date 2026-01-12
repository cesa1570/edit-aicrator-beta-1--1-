import React from 'react';
import { Palette, X, Check, Zap, Layers, Info, Camera, Monitor, Film } from 'lucide-react';

export interface StyleOption {
  id: string;
  name: string;
  description: string;
  dna: string[];
  image: string;
  technicalHint: string;
}

// ✅ อัปเดตข้อมูล: เพิ่ม Marvel + Manga
export const STYLES: StyleOption[] = [
  {
    id: 'Cinematic',
    name: 'Cinematic Master',
    description: 'High-end Hollywood aesthetics with professional depth of field and color grading.',
    dna: ['Anamorphic Lens', 'Golden Hour', 'Shallow Focus', '8K Raw'],
    image: '/images/cinematic.jpeg',
    technicalHint: 'Adds: 35mm lens, dramatic lighting, anamorphic flares, color-graded'
  },
  {
    id: 'Marvel',
    name: 'Marvel Comic',
    description: 'Bold ink lines, dynamic action poses, and vibrant colors inspired by Western superhero comics.',
    dna: ['Bold Ink', 'Jack Kirby', 'Vibrant Color', 'Action Shot'],
    image: '/images/marvel.jpg',
    technicalHint: 'marvel comic style, stan lee, jack kirby, bold thick outlines, dynamic action pose, vibrant cmyk colors, comic book shading, dramatic musculature, western comic aesthetic'
  },
  {
    id: 'MangaClassic',
    name: 'Classic Manga',
    description: 'Traditional Japanese black and white aesthetic with screen tones and speed lines.',
    dna: ['Black & White', 'Screen Tones', 'G-Pen', 'Shonen Jump'],
    image: '/images/manga.jpg',
    technicalHint: 'classic manga style, shonen jump, black and white, screen tones, speed lines, g-pen ink, high contrast, japanese comic aesthetic, detailed background'
  },
  {
    id: 'Anime',
    name: 'Neo Anime',
    description: 'Vibrant cel-shaded visuals inspired by modern Makoto Shinkai animation.',
    dna: ['Saturated Colors', 'Expressive Lines', 'Stylized Sky', 'Hand-drawn feel'],
    image: '/images/anime.jpeg',
    technicalHint: 'Adds: cel shaded, vibrant lines, anime aesthetic, stylized textures'
  },
  {
    id: 'Cyberpunk',
    name: 'Cyberpunk Edgy',
    description: 'Dystopian future aesthetics with high-contrast neon and rainy reflections.',
    dna: ['Neon Glow', 'Chromatic Aberration', 'Volumetric Fog', 'Night City'],
    image: '/images/cyberpunk.jpg',
    technicalHint: 'Adds: neon lights, rainy street, cyberpunk aesthetic, high contrast'
  },
  {
    id: 'Horror',
    name: 'Atmospheric Horror',
    description: 'Eerie, desaturated, and high-tension compositions for mystery and suspense.',
    dna: ['Chiaroscuro', 'Heavy Grain', 'Shadow Play', 'Creepy Details'],
    image: '/images/horror.jpeg',
    technicalHint: 'Adds: dark atmosphere, grainy texture, low-key lighting, spooky vibe'
  },
  {
    id: 'Documentary',
    name: 'Nature',
    description: 'Realistic, high-fidelity textures with neutral, natural lighting.',
    dna: ['Natural Light', 'Macro Detail', 'True Color', 'Clean Frame'],
    image: '/images/nature.jpg',
    technicalHint: 'Adds: neutral lighting, documentary style, macro lens, realistic textures'
  },
  {
    id: 'Unreal',
    name: 'Unreal Engine 5',
    description: 'Hyper-realistic 3D rendering with advanced global illumination and ray tracing.',
    dna: ['Lumen', 'Nanite', 'Ray Tracing', '8K Render'],
    image: '/images/unreal.png',
    technicalHint: 'Adds: Unreal Engine 5 render, 8k resolution, lumen global illumination'
  },
  {
    id: 'JunjiIto',
    name: 'Horror Manga',
    description: 'Spirals, body horror, and psychological terror in the style of Junji Ito.',
    dna: ['Junji Ito', 'Manga Horror', 'Gore', 'Spiral'],
    image: '/images/junji.jpg',
    technicalHint: 'junji ito style, manga horror, black and white, grotesque, psychological horror, detailed line work, cross-hatching, spiral patterns, unsettling, body horror, dark fantasy anime'
  },
  {
    id: 'Lego',
    name: 'Brick Construction',
    description: 'The world reimagined as plastic bricks with stunning macro details and gloss.',
    dna: ['Plastic Texture', 'Studs', 'Tilt-shift', 'Toy Photography'],
    image: '/images/lego.jpeg',
    technicalHint: 'lego style, plastic bricks, macro photography, tilt-shift, studs, glossy plastic, toy aesthetic, miniature world, vibrant colors'
  },
  {
    id: 'Disney',
    name: 'Pixar Magic',
    description: 'Heartwarming 3D animation style with soft lighting, big eyes, and magical vibes.',
    dna: ['Pixar Style', 'Soft Light', 'Expressive', '3D Render'],
    image: '/images/disney.jpg',
    technicalHint: 'pixar style, disney animation, 3d render, soft subsurface scattering, expressive character, cute, dreamy lighting, cinema 4d, octane render'
  },
  {
    id: 'Minecraft',
    name: 'Minecraft Voxel',
    description: 'A blocky, voxel-based aesthetic inspired by the iconic sandbox game.',
    dna: ['Voxel Art', 'Blocky', '8-Bit 3D', 'Sandbox'],
    image: '/images/minecraft.jpg',
    technicalHint: 'minecraft video game style, voxel art, blocky characters, pixelated textures, isometric view, bright colors, cubic world, shaders'
  }
];

interface ArtStyleSelectorProps {
  selectedId: string;
  onSelect: (id: string) => void;
  onClose: () => void;
}

const ArtStyleSelector: React.FC<ArtStyleSelectorProps> = ({ selectedId, onSelect, onClose }) => {
  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-md p-6 animate-in fade-in duration-300">
      <div className="bg-white border border-slate-200 w-full max-w-7xl rounded-[2.5rem] p-12 relative shadow-2xl overflow-hidden ring-1 ring-slate-200">

        {/* Background Blobs - Softer for Light Mode */}
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-purple-200/40 blur-[100px] rounded-full pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-blue-200/40 blur-[100px] rounded-full pointer-events-none"></div>

        {/* Close Button */}
        <button onClick={onClose} className="absolute top-10 right-10 text-slate-400 hover:text-slate-900 transition p-2 active:scale-90 z-20 bg-slate-50 rounded-full hover:bg-slate-100">
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-10 relative z-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="w-14 h-14 bg-purple-50 rounded-2xl flex items-center justify-center text-purple-600 border border-purple-100 shadow-sm">
                <Palette size={28} />
              </div>
              <h3 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Artistic Direction</h3>
            </div>
            <p className="text-slate-500 text-xs font-black uppercase tracking-[0.2em] ml-1">Select visual parameters for the Neural Generation Engine</p>
          </div>
          <div className="px-6 py-2 bg-slate-50 rounded-full flex items-center gap-3 border border-slate-200 shadow-sm">
            <Layers size={14} className="text-purple-600" />
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{STYLES.length} Multi-Spectral Style Kernels</span>
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-slate-100 pb-20">
          {STYLES.map((style) => (
            <button
              key={style.id}
              onClick={() => { onSelect(style.id); onClose(); }}
              className={`group relative flex flex-col text-left rounded-[2rem] border-2 transition-all duration-300 overflow-hidden active:scale-95 h-full shadow-sm hover:shadow-lg ${selectedId === style.id
                ? 'border-purple-600 bg-purple-50 ring-4 ring-purple-100'
                : 'border-slate-200 bg-white hover:border-purple-200 hover:bg-slate-50'
                }`}
            >
              {/* Visual Preview Container */}
              <div className="h-48 w-full relative overflow-hidden">
                <img
                  src={style.image}
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                  alt={style.name}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-60"></div>

                {/* DNA Tags Overlay */}
                <div className="absolute bottom-4 left-4 flex flex-wrap gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  {style.dna.slice(0, 2).map((tag, i) => (
                    <span key={i} className="text-[9px] font-bold uppercase bg-white/90 backdrop-blur-md px-2 py-0.5 rounded-md text-slate-900 shadow-sm border border-slate-100">
                      {tag}
                    </span>
                  ))}
                </div>

                {selectedId === style.id && (
                  <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shadow-lg animate-in zoom-in duration-300 border-2 border-white">
                    <Check size={16} className="text-white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Text Content */}
              <div className="p-5 flex-1 flex flex-col">
                <div className="mb-3">
                  <h4 className={`text-lg font-black uppercase tracking-tight transition-colors mb-1 ${selectedId === style.id ? 'text-purple-700' : 'text-slate-900'}`}>
                    {style.name}
                  </h4>
                  <div className={`flex items-center gap-2 text-[9px] font-bold uppercase tracking-widest ${selectedId === style.id ? 'text-purple-500' : 'text-slate-400'}`}>
                    <Camera size={10} /> Lens Core Active
                  </div>
                </div>

                <p className="text-[12px] text-slate-500 leading-relaxed font-medium font-kanit italic mb-5 line-clamp-2">
                  {style.description}
                </p>

                <div className="mt-auto space-y-3">
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 group-hover:bg-white group-hover:border-slate-200 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Monitor size={10} className="text-blue-500" />
                      <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Engine Parameters</span>
                    </div>
                    <p className="text-[9px] text-slate-400 leading-tight italic font-mono uppercase tracking-tighter line-clamp-2">
                      {style.technicalHint}
                    </p>
                  </div>

                  <div className={`flex items-center justify-center gap-2 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${selectedId === style.id ? 'bg-purple-600 text-white shadow-lg shadow-purple-200' : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200 group-hover:text-slate-700'
                    }`}>
                    <Film size={12} /> {selectedId === style.id ? 'Selected Pattern' : 'Select Pattern'}
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Footer */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-white/95 backdrop-blur-xl border-t border-slate-200 flex flex-col md:flex-row items-center justify-between gap-6 z-10 rounded-b-[2.5rem]">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Info size={14} className="text-slate-400" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Hardware Acceleration: V4 Cluster Active</span>
            </div>
            <div className="flex items-center gap-2">
              <Zap size={14} className="text-orange-500" fill="currentColor" />
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Style Transfer Optimization: On</span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="px-10 py-4 bg-slate-900 text-white rounded-xl text-[10px] font-black uppercase tracking-[0.2em] hover:bg-slate-800 transition shadow-xl border border-slate-800 active:scale-95"
          >
            Deploy Settings
          </button>
        </div>
      </div>
    </div>
  );
};

export default ArtStyleSelector;