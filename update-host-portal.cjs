const fs = require('fs');
const file = 'src/components/vip/HostPortalModal.tsx';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(
  /interface Props \{[\s\S]*?onSelectPassToView\?: \(pass: GuestPass\) => void;\n\}/m,
  `interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSelectPassToView?: (pass: GuestPass) => void;
  inlineMode?: boolean;
}`
);

content = content.replace(
  /export const HostPortalModal: React\.FC<Props> = \(\{ isOpen, onClose, onSelectPassToView \}\) => \{/m,
  `export const HostPortalModal: React.FC<Props> = ({ isOpen, onClose, onSelectPassToView, inlineMode = false }) => {`
);

const newContentTemplate = `  const contentWrapper = (
    <div className={\`relative w-full max-w-2xl mx-auto bg-white rounded-2xl sm:rounded-3xl border border-gray-100 text-gray-800 shadow-sm overflow-hidden flex flex-col \${inlineMode ? 'min-h-[70vh]' : 'my-auto max-h-[94vh] sm:max-h-[92vh] shadow-2xl'}\`}>
      
      {/* Top Header */}
      {!inlineMode && (
        <div className="px-4 py-3 sm:px-6 sm:py-4 bg-gray-50/80 backdrop-blur-sm border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl sm:rounded-2xl bg-white border border-gray-100 flex items-center justify-center text-gray-700 shadow-sm shrink-0">
              <KeyRound className="w-4 h-4 sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h2 className="font-semibold text-sm sm:text-lg text-gray-900 leading-tight truncate">
                Pannello Host • VIP Pass & Smart Lock
              </h2>
              <p className="text-[11px] sm:text-xs text-gray-500 font-mono truncate">
                Appartamento Aurora in Valtellina
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-white hover:bg-gray-100 text-gray-500 hover:text-gray-900 border border-gray-100 shadow-sm flex items-center justify-center transition cursor-pointer shrink-0 ml-2"
          >
            <X className="w-4 h-4 sm:w-5 sm:h-5" />
          </button>
        </div>
      )}`;

content = content.replace(
  /<div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black\/85 backdrop-blur-md animate-fade-in overflow-y-auto">[\s\S]*?<div className="px-4 py-3 sm:px-6 sm:py-4 bg-\[#1f1d1b\] border-b border-white\/10 flex items-center justify-between shrink-0">[\s\S]*?<\/div>/m,
  newContentTemplate
);

content = content.replace(
  /{\/\* Auth Barrier if not unlocked \*\/}\s*{\!isAuthenticated \? \([\s\S]*?<\/div>\n\s*\)\s*:\s*\(/m,
  `{/* Auth Barrier if not unlocked */}
      {!isAuthenticated && !inlineMode ? (
        <div className="p-6 sm:p-8 text-center space-y-5 my-auto">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center text-gray-600 mx-auto">
            <Lock className="w-6 h-6 sm:w-7 sm:h-7" />
          </div>
          <div className="space-y-2">
            <h3 className="text-base sm:text-lg font-semibold text-gray-900 tracking-tight">Portale host protetto</h3>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              La gestione è disponibile esclusivamente nel portale host con autenticazione email e password.
            </p>
          </div>
          <a
            href="/host-portal/"
            className="inline-flex w-full max-w-xs justify-center rounded-xl bg-black py-2.5 text-sm font-medium text-white transition hover:bg-gray-800 shadow-sm"
          >
            Apri portale host
          </a>
        </div>
      ) : (`
);


// Replace the ending div and return statement
const endReplacement = `  if (inlineMode) {
    return contentWrapper;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-gray-900/40 backdrop-blur-sm animate-fade-in overflow-y-auto">
      {contentWrapper}
    </div>
  );
};`;
content = content.replace(/<\/div>\n\s*<\/div>\n\s*\);\n};/m, endReplacement);


fs.writeFileSync(file, content);
