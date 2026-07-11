export default function Footer() {
  return (
    <footer className="border-t border-nexus-border bg-nexus-surface/50 py-4 px-6 flex-shrink-0">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-nexus-muted">
        <p>
          © 2026{' '}
          <span className="text-nexus-accent font-semibold">StadiumMind AI</span>
          {' '}· Powered by{' '}
          <span className="text-nexus-primary font-semibold">Google Gemini</span>
        </p>
        <p>StadiumMind AI · Stadium Operating System v1.0</p>
      </div>
    </footer>
  );
}
