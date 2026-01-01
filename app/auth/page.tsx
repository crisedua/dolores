import { AuthForm } from '@/components/auth/AuthForm';
import { Gem } from 'lucide-react';

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full flex flex-col items-center px-4">
                <div className="mb-8 text-center flex flex-col items-center">
                    <div className="w-12 h-12 bg-blue-600 text-white flex items-center justify-center rounded-xl shadow-lg shadow-blue-500/20 mb-4">
                        <Gem size={24} />
                    </div>
                    <div className="text-3xl font-bold text-white mb-2">
                        Veta
                    </div>
                    <div className="text-gray-500 text-sm tracking-widest uppercase font-bold">Descubre Oportunidades</div>
                </div>

                <AuthForm />
            </div>
        </div>
    );
}
