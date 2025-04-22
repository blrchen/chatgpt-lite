import React from "react";

export default function WelcomeSection() {
  return (
    <div className="flex flex-col items-center py-10 px-4 w-full bg-white">
      <div className="flex flex-col items-center w-11/12 md:w-10/12">
        {/* Top: Emoji + Title */}
        <div className="flex items-center gap-3 mb-4">
          <img
            alt="👋"
            loading="lazy"
            width={40}
            height={40}
            src="https://registry.npmmirror.com/@lobehub/fluent-emoji-anim-1/latest/files/assets/1f44b.webp"
            className="flex-shrink-0"
          />
          <h1 className="text-4xl font-extrabold tracking-tight">Good Afternoon</h1>
        </div>
        {/* Description */}
        <div className="text-center text-lg text-gray-700 mb-8">
          <p>I am your personal intelligent assistant LobeChat. How can I assist you today?</p>
          <p className="mt-1">If you need a more professional or customized assistant, you can click <code className="rounded bg-gray-100 px-1 py-0.5 text-sm">+</code> to create a custom assistant.</p>
        </div>
        {/* Card: Recommendations */}
        <div className="w-full bg-white rounded-xl shadow p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-gray-600 text-base">New Assistant Recommendations:</div>
            <button className="flex items-center justify-center h-6 w-6 rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-refresh-cw text-gray-400"><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path><path d="M21 3v5h-5"></path><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path><path d="M8 16H3v5"></path></svg>
            </button>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card 1 */}
            <a href="/discover/assistant/academic-paper-overview" className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:shadow-md transition">
              <img alt="⚗️" width={40} height={40} src="https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets/2697-fe0f.webp" className="flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <div className="font-bold text-base truncate">学术论文综述专家</div>
                <div className="text-gray-500 text-sm truncate">擅长高质量文献检索与分析的学术研究助手</div>
              </div>
            </a>
            {/* Card 2 */}
            <a href="/discover/assistant/crontab-generate" className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:shadow-md transition">
              <img alt="⏰" width={40} height={40} src="https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets/23f0.webp" className="flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <div className="font-bold text-base truncate">Cron Expression Assistant</div>
                <div className="text-gray-500 text-sm truncate">Crontab Expression Generator</div>
              </div>
            </a>
            {/* Card 3 */}
            <a href="/discover/assistant/xiao-zhi-french-translation-asst-v-1" className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:shadow-md transition">
              <img alt="🇫🇷" width={40} height={40} src="https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets/1f1eb-1f1f7.webp" className="flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <div className="font-bold text-base truncate">Xiao Zhi French Translation Assistant</div>
                <div className="text-gray-500 text-sm truncate">A friendly, professional, and empathetic AI assistant for French translation</div>
              </div>
            </a>
            {/* Card 4 */}
            <a href="/discover/assistant/graham-investmentassi" className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-4 hover:shadow-md transition">
              <img alt="📈" width={40} height={40} src="https://registry.npmmirror.com/@lobehub/fluent-emoji-3d/latest/files/assets/1f4c8.webp" className="flex-shrink-0" />
              <div className="flex flex-col overflow-hidden">
                <div className="font-bold text-base truncate">Investment Assistant</div>
                <div className="text-gray-500 text-sm truncate">Helps users calculate the data needed for valuation</div>
              </div>
            </a>
          </div>
        </div>
        {/* FAQ Section */}
        <div className="w-full bg-white rounded-xl shadow p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="font-medium text-gray-600 text-base">Frequently Asked Questions:</div>
            <a target="_blank" rel="noopener noreferrer" href="https://lobehub.com/docs/usage" className="flex items-center justify-center h-6 w-6 rounded bg-gray-50 border border-gray-200 hover:bg-gray-100 transition">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-arrow-right text-gray-400"><path d="M5 12h14"></path><path d="m12 5 7 7-7 7"></path></svg>
            </a>
          </div>
          <div className="space-y-2">
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-800">Does it support a plugin system?</div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-800">What features does LobeChat support?</div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-800">What should I do if I encounter issues while using it?</div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-800">Does it support speech synthesis and speech recognition?</div>
            <div className="bg-gray-50 rounded-lg px-4 py-2 text-gray-800">Does it support local language models?</div>
          </div>
        </div>
      </div>
    </div>
  );
}
