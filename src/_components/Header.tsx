import { DropdownFile } from "@/_components/DropdownFile";
import { IconGithub } from "@/_components/Icons";

export function Header() {
  return (
    <header className="no-select">
      <div id="header-logo">
        <img src="/metadata/icon.svg" alt="Logo" />
        <h1>SimDraft</h1>
      </div>
      <div id="header-controls">
        <DropdownFile />
        <div id="info-popover-container">
          <button type="button" aria-label="Info" aria-describedby="info-popover">
            <span aria-hidden="true">?</span>
          </button>
          <div role="tooltip" id="info-popover">
            <div>
              <p>
                SimDraft is not endorsed by Riot Games and does not reflect the views or opinions of Riot Games or
                anyone officially involved in producing or managing Riot Games properties. Riot Games and all associated
                properties are trademarks or registered trademarks of Riot Games, Inc.
              </p>
              <p>
                All Riot-owned IP & assets <em>(except manual SVG reproductions of PNGs)</em> were procured through{" "}
                <a href="https://communitydragon.org/" target="_blank" rel="noopener noreferrer">
                  CommunityDragon
                </a>{" "}
                following Riot Games' "
                <a href="https://www.riotgames.com/en/legal" target="_blank" rel="noopener noreferrer">
                  Legal Jibber Jabber
                </a>
                " .
              </p>
              <p>
                © 2025 SimDraft by{" "}
                <a href="https://github.com/MGSimard" target="_blank" rel="noopener noreferrer">
                  MGSimard
                </a>
                .
              </p>
            </div>
          </div>
        </div>
        <a href="https://github.com/MGSimard/simdraft" target="_blank" rel="noopener noreferrer">
          <IconGithub aria-hidden="true" />
        </a>
      </div>
    </header>
  );
}
