import anime from "animejs";

const particlesOffSets = {
  left: {
    overlayImage: 0,
  },
  right: {
    overlayImage: 1030,
  },
};

const playAnimationTo = (position) => {
  const offsets = particlesOffSets[position];
  const timeline = anime.timeline({
    duration: 2500,
    easing: "easeOutExpo",
  });
  Object.keys(offsets).forEach((key, idx) => {
    timeline.add(
      {
        targets: `.particle.${key}`,
        translateX: offsets[key],
      },
      75 * idx
    );
  });
};

export default playAnimationTo;
