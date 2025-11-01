export default function Navbar() {
    return (
        <nav className="flex items-center justify-between py-3">
            <strong className="text-xl font-semibold tracking-tight">David Antwi</strong>
            <div className="space-x-4">
                <a className="text-gray-600 hover:text-indigo-600" href="#projects">Projects</a>
                <a className="text-gray-600 hover:text-indigo-600" href="#about">About</a>
                <a className="text-gray-600 hover:text-indigo-600" href="#contact">Contact</a>
            </div>
        </nav>
    )
}