export function Header() {
  return (
    <header className="no-select">
      <div id="header-logo">
        <img src="/metadata/icon.svg" alt="Logo" />
        <h1>SimDraft</h1>
      </div>
      <div id="header-controls">
        <div id="info-popover-container">
          <button type="button" aria-label="Close" popoverTarget="info-popover">
            <span>?</span>
          </button>
          <div id="info-popover" className="popover" popover="auto">
            <p>Test</p>
          </div>
        </div>
        <button type="button" aria-label="Minimize">
          <span>x</span>
        </button>
        <button type="button" aria-label="Maximize">
          <span>x</span>
        </button>
      </div>
    </header>
  );
}
