import { useAuth } from '../contexts/AuthContext';

// ⚠️ IMPORTANT: Add your admin emails here
const ADMIN_EMAILS = [
    'admin@auto-shorts.ai', // Placeholder
    'tanaponlomrit47110@gmail.com',
    'beem0828422170@gmail.com',
    'onlydev@autocreator.com',
    'admin_x9k2@secure.test' // Hard test account
];

export const useAdmin = () => {
    const { user } = useAuth();

    const isAdmin = !!(user?.email && ADMIN_EMAILS.map(e => e.toLowerCase()).includes(user.email.toLowerCase()));

    return {
        isAdmin,
        user
    };
};
