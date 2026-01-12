import React, { useEffect, useState } from 'react';
import { listProjects, ProjectData, deleteProject } from '../services/projectService';
import { Layout, Video, Calendar, Search, Trash2, FolderOpen, Play, Edit3 } from 'lucide-react';

interface AssetLibraryProps {
    onOpenProject?: (project: ProjectData) => void;
}

const AssetLibrary: React.FC<AssetLibraryProps> = ({ onOpenProject }) => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'shorts' | 'long'>('all');
    const [search, setSearch] = useState('');

    const fetchProjects = async () => {
        setLoading(true);
        try {
            const allProjects = await listProjects();
            setProjects(allProjects.sort((a, b) => b.lastUpdated - a.lastUpdated));
        } catch (error) {
            console.error("Error fetching projects", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProjects();
    }, []);

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (confirm("Are you sure you want to delete this project?")) {
            await deleteProject(id);
            fetchProjects();
        }
    };

    const filteredProjects = projects.filter(p => {
        const matchesType = filter === 'all' || p.type === filter || (filter === 'shorts' && !p.type); // Default to shorts
        const matchesSearch = (p.topic || p.title || 'Untitled').toLowerCase().includes(search.toLowerCase());
        return matchesType && matchesSearch;
    });

    return (
        <div className="space-y-8 pb-32 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-end justify-between gap-6 border-b border-slate-200 pb-8">
                <div>
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter flex items-center gap-3">
                        <FolderOpen className="text-purple-600" size={32} /> Project Library
                    </h2>
                    <p className="text-slate-500 font-medium mt-2">Manage and edit your video productions.</p>
                </div>

                <div className="flex items-center gap-2 bg-white p-1.5 rounded-xl border border-slate-200 shadow-sm">
                    <button onClick={() => setFilter('all')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-slate-900 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>All</button>
                    <button onClick={() => setFilter('shorts')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'shorts' ? 'bg-orange-500 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Shorts</button>
                    <button onClick={() => setFilter('long')} className={`px-4 py-2 rounded-lg text-xs font-black uppercase tracking-widest transition-all ${filter === 'long' ? 'bg-blue-600 text-white' : 'text-slate-500 hover:bg-slate-100'}`}>Long Form</button>
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-xl">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                <input
                    type="text"
                    placeholder="Search projects..."
                    className="w-full bg-white border border-slate-200 rounded-xl py-4 pl-12 pr-4 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 transition-all font-medium"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                />
            </div>

            {/* Content */}
            {loading ? (
                <div className="py-20 text-center text-slate-400 font-bold animate-pulse">Loading Library...</div>
            ) : filteredProjects.length === 0 ? (
                <div className="py-20 text-center flex flex-col items-center gap-4">
                    <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center text-slate-300">
                        <FolderOpen size={40} />
                    </div>
                    <div>
                        <p className="text-slate-900 font-bold text-lg">No projects found</p>
                        <p className="text-slate-500 text-sm">Start a new creation from the Tools Hub.</p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredProjects.map(project => (
                        <div
                            key={project.id}
                            onClick={() => onOpenProject && onOpenProject(project)}
                            className="group bg-white border border-slate-200 rounded-2xl p-5 cursor-pointer hover:shadow-xl hover:shadow-purple-900/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden"
                        >
                            <div className={`absolute top-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2 z-10`}>
                                <button
                                    onClick={(e) => handleDelete(project.id, e)}
                                    className="p-2 bg-white text-red-500 rounded-lg shadow-sm hover:bg-red-50 transition-colors border border-slate-100"
                                    title="Delete Project"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>

                            <div className="flex items-start justify-between mb-4">
                                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${project.type === 'long' ? 'bg-blue-100 text-blue-600' : 'bg-orange-100 text-orange-600'}`}>
                                    {project.type === 'long' ? <Video size={24} /> : <Layout size={24} />}
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 bg-slate-100 px-2 py-1 rounded-lg">
                                    {project.type || 'SHORTS'}
                                </span>
                            </div>

                            <h3 className="text-lg font-black text-slate-900 leading-tight mb-2 line-clamp-2 min-h-[3rem]">
                                {project.topic || project.title || "Untitled Project"}
                            </h3>

                            <div className="flex items-center gap-4 text-xs text-slate-500 font-medium border-t border-slate-100 pt-4 mt-2">
                                <div className="flex items-center gap-1.5">
                                    <Calendar size={14} className="text-slate-400" />
                                    {new Date(project.lastUpdated).toLocaleDateString()}
                                </div>
                                <div className="flex items-center gap-1.5 ml-auto text-purple-600 font-bold group-hover:translate-x-1 transition-transform">
                                    Open Project <Play size={10} fill="currentColor" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssetLibrary;
