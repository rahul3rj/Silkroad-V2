// HelpWidget — floating help/chat widget
// TODO: Integrate with Intercom or Crisp for live chat support
export function HelpWidget() {
  return (
    <button className="fixed bottom-6 right-6 z-30 w-12 h-12 bg-white text-black rounded-full shadow-lg flex items-center justify-center text-lg hover:scale-110 transition-transform">
      ?
    </button>
  );
}
