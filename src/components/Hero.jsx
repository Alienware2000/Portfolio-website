// export default function Hero() {
//     return (
//         <section id="hero" className="mt-16"> 
//             <h2 className="text-4xl font-bold text-indigo-600">Hi, I’m David</h2>
//             <p className="mt-2 text-gray-700">
//                 I build software/hardware projects and love teaching.
//             </p>
//         </section>
//     )
// }

// src/components/Hero.jsx
import Typewriter from "./Typewriter.jsx";

export default function Hero() {
  return (
    <section id="hero" className="mt-16">
      <h2 className="text-4xl font-bold text-indigo-600">
        <Typewriter text="Hi there, I'm David." speed={45} />
      </h2>
      <p className="mt-2 text-gray-700 dark:text-gray-300">
        I build software/hardware projects and love teaching.
      </p>
    </section>
  );
}
