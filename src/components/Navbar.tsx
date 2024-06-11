import { tv } from "tailwind-variants";
import { ThemeToggle } from "./ThemeToggle";
import bunny from "/bunny.svg";

const navLink = tv({ base: "font-medium hover:underline" });

export function Navbar() {
  return (
    <nav className="mb-8 p-4 flex items-center gap-4 border-b border-neutral-300 dark:border-neutral-700">
      <a className="flex items-center gap-2" href="/">
        <img src={bunny} width={32} alt="" />
        <h1 className="text-xl md:text-2xl font-light">bunny google fonts</h1>
      </a>
      <div className="mx-auto" />
      <a
        className={navLink()}
        href="http://github.com/rayzr522/bunny-google-fonts"
        target="_blank"
        rel="noopener noreferrer"
      >
        Source
      </a>
      <a
        className={navLink()}
        href="http://github.com/rayzr522/bunny-google-fonts/issues"
        target="_blank"
        rel="noopener noreferrer"
      >
        Issues
      </a>
      <ThemeToggle />
    </nav>
  );
}
