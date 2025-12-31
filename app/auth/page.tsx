import { AuthForm } from '@/components/auth/AuthForm';

export default function AuthPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-black relative">
            {/* Background Elements */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-900/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full flex flex-col items-center px-4">
                <div className="mb-8 text-center">
                    {/* Logo could go here */}
                    <div className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500 mb-2">
                        Dolores
                    </div>
                    <div className="text-gray-500 text-sm tracking-widest uppercase font-bold">Problem Discovery</div>
                </div>

                <AuthForm />
            </div>
        </div>
    );
}
