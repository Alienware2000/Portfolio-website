/**
 * Skills Component
 * Visual representation of technical skills with animated progress bars
 */
import { motion } from "framer-motion";
import { useInView } from "framer-motion";
import { useRef } from "react";

const skillCategories = [
  {
    title: "Programming Languages",
    skills: [
      { name: "Python", level: 92 },
      { name: "JavaScript/TypeScript", level: 85 },
      { name: "C++", level: 88 },
      { name: "C", level: 82 },
    ]
  },
  {
    title: "ML & Frameworks",
    skills: [
      { name: "PyTorch", level: 88 },
      { name: "TensorFlow/Keras", level: 85 },
      { name: "React/Next.js", level: 87 },
      { name: "FastAPI", level: 80 },
    ]
  },
  {
    title: "Specializations",
    skills: [
      { name: "Machine Learning", level: 88 },
      { name: "Embedded Systems", level: 90 },
      { name: "TinyML", level: 85 },
      { name: "Web Development", level: 85 },
    ]
  }
];

export default function Skills() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-10% 0px" });

  return (
    <div ref={ref} className="grid gap-8 md:grid-cols-3">
      {skillCategories.map((category, categoryIndex) => (
        <motion.div
          key={category.title}
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.55, delay: categoryIndex * 0.06, ease: "easeOut" }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-200 mb-3">
            {category.title}
          </h3>
          <div className="space-y-3">
            {category.skills.map((skill) => (
              <div key={skill.name} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-700 dark:text-slate-300 font-medium text-sm">
                    {skill.name}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {skill.level}%
                  </span>
                </div>
                <div className="h-2 rounded-full bg-slate-200/60 dark:bg-slate-800/60 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={isInView ? { width: `${skill.level}%` } : { width: 0 }}
                    transition={{ duration: 0.6, delay: categoryIndex * 0.06 + 0.15, ease: "easeOut" }}
                    className="h-full rounded-full bg-blue-600 dark:bg-blue-500"
                  />
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      ))}
    </div>
  );
}

