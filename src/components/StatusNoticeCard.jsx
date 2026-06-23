import '../styles/statusNoticeCard.css';

export default function StatusNoticeCard({ type = 'waiting', title, children, items = [], meta = [] }) {
  return (
    <div className={`statusNoticeCard statusNoticeCard--${type}`}>
      {title && <h4>{title}</h4>}
      {children && <p>{children}</p>}
      {items.length > 0 && <ul>{items.map(item => <li key={item}>{item}</li>)}</ul>}
      {meta.length > 0 && <div className="statusNoticeCard__meta">{meta.map(item => <span key={item}>{item}</span>)}</div>}
    </div>
  );
}
