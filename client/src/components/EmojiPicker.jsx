const FOOD_EMOJIS = ['🍕', '🍔', '🌮', '🍣', '🍜', '🥗', '🍗', '🥩', '🍤', '🍝', '🥪', '🍛', '🧁', '☕', '🥤', '🍺', '📦'];

export default function EmojiPicker({ value, onChange }) {
  return (
    <div className="emoji-picker">
      {FOOD_EMOJIS.map((emoji) => (
        <button
          key={emoji}
          type="button"
          className={`emoji-btn ${value === emoji ? 'selected' : ''}`}
          onClick={() => onChange(emoji)}
        >
          {emoji}
        </button>
      ))}
    </div>
  );
}

export { FOOD_EMOJIS };
