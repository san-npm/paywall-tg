'use client';

export default function GlobalEmojiBackground() {
  const emojis = [
    ['ge1', '🦞'],
    ['ge2', '🍆'],
    ['ge3', '🍑'],
    ['ge4', '🌈'],
    ['ge5', '🤑'],
    ['ge6', '🫰'],
    ['ge7', '💎'],
  ];

  return (
    <div className="emoji-cloud-global" aria-hidden="true">
      {emojis.map(([cls, em]) => (
        <img
          key={cls}
          className={`emoji-float-global ${cls}`}
          src={`https://emojicdn.elk.sh/${encodeURIComponent(em)}?style=apple`}
          alt=""
          loading="lazy"
          decoding="async"
        />
      ))}
    </div>
  );
}
