import ThemeToggle from "./ThemeToggle.jsx";

export default function Navbar() {
    return (
        <nav className="mt-4 flex items-center justify-between py-4">
            <strong className="text-xl font-semibold tracking-tight">
                <a href="#">David Antwi</a>
            </strong>
            <div className="flex items-center gap-6 text-gray-600 dark:text-gray-300">
                <a className="hover:text-gray-900 dark:hover:text-white" href="#projects">Projects</a>
                <a className="hover:text-gray-900 dark:hover:text-white" href="#about">About</a>
                <a className="hover:text-gray-900 dark:hover:text-white" href="#contact">Contact</a>
                <ThemeToggle />
            </div>
        </nav>
    )
}