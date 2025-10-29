import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* 로고 및 제목 */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-2xl">
              <div className="w-10 h-10 relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                    <div className="w-6 h-6 bg-white rounded-sm opacity-80"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">AIPixels</h1>
          <p className="text-white/70">AI 이미지 생성 커뮤니티에 오신 것을 환영합니다</p>
        </div>

        {/* Clerk Sign In 컴포넌트 */}
        <div className="flex justify-center">
          <SignIn
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "bg-white/10 backdrop-blur-md border border-white/20 shadow-2xl",
                headerTitle: "text-white",
                headerSubtitle: "text-white/70",
                socialButtonsBlockButton: "bg-white/10 border border-white/20 text-white hover:bg-white/20",
                formButtonPrimary: "bg-blue-600 hover:bg-blue-700",
                footerActionLink: "text-blue-400 hover:text-blue-300",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-blue-400",
                formFieldLabel: "text-white",
                formFieldInput: "bg-white/10 border-white/20 text-white placeholder:text-white/50",
                formFieldInputShowPasswordButton: "text-white/70",
                dividerLine: "bg-white/20",
                dividerText: "text-white/70",
                otpCodeFieldInput: "bg-white/10 border-white/20 text-white",
                formResendCodeLink: "text-blue-400 hover:text-blue-300",
                alert: "bg-red-500/20 border border-red-500/30 text-red-300",
                alertText: "text-red-300",
              },
              layout: {
                logoPlacement: "none",
              },
            }}
            routing="path"
            path="/sign-in"
            redirectUrl="/generate"
            signUpUrl="/sign-up"
          />
        </div>

        {/* 추가 정보 */}
        <div className="mt-8 text-center">
          <p className="text-white/60 text-sm">
            로그인하여 AI 이미지 생성을 시작하세요
          </p>
        </div>
      </div>
    </div>
  );
}

