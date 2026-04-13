'use client';

import { useState } from 'react';
import { Zap, BrainCircuit, LineChart } from 'lucide-react';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);

  return (
    <div className="flex w-full h-screen">
      {/* Left Side: Form Area (40%) */}
      <div className="w-full lg:w-[40%] bg-white flex flex-col justify-center items-center p-8 sm:p-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
              {isLogin ? 'Hesab&apos;ınıza Giriş Yapın' : 'Yeni Hesap Oluşturun'}
            </h2>
            <p className="mt-2 text-sm text-gray-600">
              {isLogin ? 'Hoş geldiniz, devam etmek için bilgilerinizi girin.' : 'E-ticaretin yeni çağına katılmak için kayıt olun.'}
            </p>
          </div>

          <form className="mt-8 space-y-6" action="#" method="POST" onSubmit={(e) => e.preventDefault()}>
            <input type="hidden" name="remember" defaultValue="true" />
            <div className="rounded-md shadow-sm -space-y-px">
              {!isLogin && (
                <div className="mb-4">
                  <label htmlFor="name" className="sr-only">Ad Soyad</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    required
                    className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm"
                    placeholder="Ad Soyad"
                  />
                </div>
              )}
              <div className="mb-4">
                <label htmlFor="email-address" className="sr-only">E-posta adresi</label>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 ${isLogin ? 'rounded-t-md' : ''} focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm`}
                  placeholder="E-posta adresi"
                />
              </div>
              <div className="mb-4">
                <label htmlFor="password" className="sr-only">Şifre</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm shadow-sm"
                  placeholder="Şifre"
                />
              </div>
            </div>

            {isLogin && (
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <input
                    id="remember-me"
                    name="remember-me"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                    Beni hatırla
                  </label>
                </div>

                <div className="text-sm">
                  <a href="#" className="font-medium text-blue-600 hover:text-blue-500">
                    Şifrenizi mi unuttunuz?
                  </a>
                </div>
              </div>
            )}

            <div>
              <button
                type="submit"
                className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm transition-colors duration-200"
              >
                {isLogin ? 'Giriş Yap' : 'Hesap Oluştur'}
              </button>
            </div>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-gray-500">Veya</span>
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="button"
                  className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors duration-200"
                >
                  <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24">
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      fill="#EA4335"
                    />
                    <path d="M1 1h22v22H1z" fill="none" />
                  </svg>
                  Google ile Giriş Yap
                </button>
              </div>
            </div>
          </form>

          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => setIsLogin(!isLogin)}
              className="text-sm font-medium text-blue-600 hover:text-blue-500"
            >
              {isLogin ? 'Hesab&apos;ınız yok mu? Kayıt Olun' : 'Zaten hesab&apos;ınız var mı? Giriş Yapın'}
            </button>
          </div>
        </div>
      </div>

      {/* Right Side: Features Area (60%) */}
      <div className="hidden lg:flex lg:w-[60%] bg-gradient-to-br from-indigo-900 via-slate-800 to-indigo-950 text-white flex-col justify-center px-16 relative overflow-hidden">
        {/* Abstract decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full opacity-10 pointer-events-none">
          <div className="absolute -top-24 -left-24 w-96 h-96 rounded-full bg-blue-500 blur-3xl"></div>
          <div className="absolute top-1/2 right-0 w-64 h-64 rounded-full bg-purple-500 blur-3xl"></div>
        </div>

        <div className="relative z-10 max-w-2xl">
          <h1 className="text-5xl font-bold tracking-tight mb-4">
            E-Ticaretin Yeni Çağına<br />Hoş Geldiniz
          </h1>
          <p className="text-xl text-indigo-200 mb-12">
            Pazaryerlerini tek bir merkezden yönetin, operasyonel yükünüzü yapay zeka ile hafifletin.
          </p>

          <div className="space-y-8">
            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-800/50 border border-indigo-700/50 text-blue-400 shadow-inner">
                  <Zap className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-xl font-semibold text-white">Işık Hızında Senkronizasyon</h3>
                <p className="mt-2 text-indigo-200">
                  Trendyol, Hepsiburada ve Amazon&apos;daki stoklarınızı milisaniyeler içinde eşitleyin.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-800/50 border border-indigo-700/50 text-purple-400 shadow-inner">
                  <BrainCircuit className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-xl font-semibold text-white">Yapay Zeka Destekli Otonom Fiyatlandırma</h3>
                <p className="mt-2 text-indigo-200">
                  Rakiplerinizi analiz edin, Buybox&apos;ı kâr marjınızı koruyarak ele geçirin.
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <div className="flex-shrink-0 mt-1">
                <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-indigo-800/50 border border-indigo-700/50 text-emerald-400 shadow-inner">
                  <LineChart className="h-6 w-6" />
                </div>
              </div>
              <div className="ml-5">
                <h3 className="text-xl font-semibold text-white">Bütünsel Kârlılık Analizi</h3>
                <p className="mt-2 text-indigo-200">
                  Komisyon, kargo ve maliyetleri tek ekranda görün, net kârınızı anında ölçün.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
