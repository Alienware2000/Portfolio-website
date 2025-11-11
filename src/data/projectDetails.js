export const projectDetails = {
  exosense: {
    overview:
      "ExoSense is an ongoing research project at Yale’s Faboratory that develops a multi-sensor wearable motion‑tracking system for an upper‑body soft exosuit. It provides the sensing backbone that lets the exosuit perceive human motion in real time and respond with adaptive assistive actuation. The current firmware, FaboIMUrig (Baseline v0.4), implements a scalable, node‑based architecture for multi‑IMU calibration—combining quaternion math, reference‑pose alignment, and synchronized streaming to capture complex limb movements with high precision.",
    challenge:
      "Accurate, drift‑resistant orientation tracking across multiple sensors on a flexible, soft‑fabric system is difficult. Each IMU can shift or twist as the user moves; coordinating multiple I²C devices (IMUs, capacitive sensors, and a multiplexer) requires careful hardware/firmware design to maintain timing precision and bandwidth.",
    solution:
      "The system uses a distributed calibration + fusion pipeline that treats each IMU as an independent node with bias correction, zero‑pose averaging, and heading alignment. A TCA9548A multiplexer manages channel routing to multiple BNO085 IMUs, while a custom quaternion library (Quat.h/.cpp) handles rotation math, normalization, and yaw extraction. An Adafruit Feather nRF52840 Sense aggregates orientation data plus capacitive touch inputs (dual MPR121 boards) for muscle‑contact feedback. The firmware streams synchronized orientation + touch at 50 Hz for visualization and ML pipelines.",
    method:
      "Firmware in C++ (Arduino framework) using modular classes (e.g., BnoNode) for scalability and maintainability. Each node owns its I²C channel, calibration, and quaternion computation before synchronized logging. Current features include gyro‑bias calibration, reference‑pose capture, heading alignment (GameRV), and CSV streaming for dataset collection. The design supports clean scaling (now 4 IMU nodes + 2 MPR121 boards) and cross‑node synchronization for reliable temporal coherence.",
    results:
      "v0.4 demonstrates stable multi‑sensor streaming at 50 Hz with consistent quaternion integrity and minimal drift under motion. Preliminary motion‑capture tests show strong agreement across nodes for common gestures (arm flexion, shoulder rotation). The architecture supports larger node arrays and will serve as the base for multimodal sensing + control in upcoming soft‑exosuit prototypes.",
    ongoing:
      "Next: guided mount‑alignment calibration, low‑pass filtering, real‑time 3D visualization, and building a motion dataset for perception models. Later: sensor‑fusion refinement and AI‑driven pose estimation to enable closed‑loop adaptive assistance."
  }
};


