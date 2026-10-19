import React, { useEffect, useMemo, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const API = import.meta.env.VITE_API_URL || '/api/livros';
const covers = ['#dbe4dc', '#eaded2', '#e4e0ef', '#e8e5d6', '#d8e4e7'];
const art = ['◒', '✳', '❋', '◉', '✦'];
const money = value => Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

function App() {
  const [books, setBooks] = useState([]);
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('');
  const [direction, setDirection] = useState('asc');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState({ nome: '', valor: '' });
  const [saving, setSaving] = useState(false);
  const [view, setView] = useState('all');
  const [favorites, setFavorites] = useState(() => {
    try { return JSON.parse(localStorage.getItem('estante-favoritos') || '[]'); }
    catch { return []; }
  });
  const [openBookMenu, setOpenBookMenu] = useState(null);
  const [detailsBook, setDetailsBook] = useState(null);

  async function loadBooks() {
    setLoading(true); setError('');
    try {
      const params = new URLSearchParams();
      if (sort) { params.set('criterio', sort); params.set('ordem', direction); }
      const response = await fetch(`${API}${params.size ? `?${params}` : ''}`);
      if (!response.ok) throw new Error('Não foi possível carregar o catálogo.');
      setBooks(await response.json());
    } catch { setError('Não foi possível conectar à API. Confira se o servidor em C está ativo.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { loadBooks(); }, [sort, direction]);

  const favoriteKey = book => `${book.nome}|${book.valor}`;
  const toggleFavorite = book => {
    const key = favoriteKey(book);
    setFavorites(current => {
      const next = current.includes(key) ? current.filter(item => item !== key) : [...current, key];
      localStorage.setItem('estante-favoritos', JSON.stringify(next));
      return next;
    });
    setOpenBookMenu(null);
  };
  const filtered = useMemo(() => books.filter(book =>
    (view === 'all' || favorites.includes(`${book.nome}|${book.valor}`)) &&
    book.nome.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))
  ), [books, query, view, favorites]);
  const total = books.reduce((sum, book) => sum + Number(book.valor), 0);
  const favoriteBooks = books.filter(book => favorites.includes(favoriteKey(book)));
  const visibleBooks = view === 'favorites' ? favoriteBooks : books;
  const visibleTotal = visibleBooks.reduce((sum, book) => sum + Number(book.valor), 0);

  async function addBook(event) {
    event.preventDefault(); setSaving(true);
    try {
      const response = await fetch(API, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ nome: form.nome.trim(), valor: Number(form.valor) }) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.erro || 'Não foi possível cadastrar o livro.');
      setForm({ nome: '', valor: '' }); setModal(false); await loadBooks();
    } catch (e) { setError(e.message || 'Falha ao cadastrar. Verifique a conexão com a API.'); }
    finally { setSaving(false); }
  }

  return <div className="app-shell">
    <aside className="sidebar">
      <a className="brand" href="#"><span className="brand-mark">e</span><span>estante<span className="brand-dot">.</span></span></a>
      <div className="side-label">BIBLIOTECA</div>
      <button className={`nav-item ${view === 'all' ? 'active' : ''}`} title="Todos os livros" onClick={() => setView('all')}><span className="nav-icon">▤</span><span className="nav-text">Todos os livros</span><span className="nav-count">{books.length}</span></button>
      <button className={`nav-item ${view === 'favorites' ? 'active' : ''}`} title="Favoritos" onClick={() => setView('favorites')}><span className="nav-icon">♡</span><span className="nav-text">Favoritos</span><span className="nav-count">{favorites.length}</span></button>
      <div className="side-bottom"><div className="side-quote">“Um livro é um sonho que você segura com as mãos.”</div><div className="quote-author">— Neil Gaiman</div><div className="profile"><div className="avatar">L</div><div><strong>Minha estante</strong><small>Leitor(a)</small></div><span className="profile-dots">···</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Biblioteca <span>/</span> <strong>{view === 'all' ? 'Todos os livros' : 'Favoritos'}</strong></div><div className="topbar-right"><span className="status-dot"/> Biblioteca pessoal <div className="mini-avatar">L</div></div></header>
      <section className="page-content">
        <div className="intro"><div><div className="eyebrow">SUA COLEÇÃO</div><h1>Uma boa história<br className="mobile-break"/> sempre encontra espaço.</h1><p className="subtitle">Organize seus títulos favoritos, um livro de cada vez.</p></div><button className="primary-button" onClick={() => { setError(''); setModal(true); }}><span>＋</span> Adicionar livro</button></div>

        <div className="stats-row"><div className="stat-card"><span className="stat-icon mint">{view === 'favorites' ? '♡' : '▤'}</span><div><span className="stat-label">{view === 'favorites' ? 'Livros favoritos' : 'Livros na estante'}</span><strong>{visibleBooks.length.toString().padStart(2, '0')}</strong></div></div><div className="stat-card"><span className="stat-icon sand">◉</span><div><span className="stat-label">{view === 'favorites' ? 'Valor dos favoritos' : 'Valor da coleção'}</span><strong>{money(visibleTotal)}</strong></div></div><div className="stat-note"><span className="sparkle">✳</span><span>Sua próxima leitura<br/><strong>está esperando por você.</strong></span></div></div>

        <div className="section-heading"><div><h2>{view === 'all' ? 'Minha biblioteca' : 'Meus favoritos'} <span>{filtered.length}</span></h2><p>{view === 'all' ? 'Todos os títulos da sua coleção, em um só lugar.' : 'Seus livros marcados para encontrar depois.'}</p></div><div className="controls"><label className="search-box"><span>⌕</span><input aria-label="Buscar livros" placeholder="Buscar na biblioteca..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></label><label className="sort-box"><span>Ordenar:</span><select value={sort ? `${sort}-${direction}` : ''} onChange={e => { const [s, d] = e.target.value ? e.target.value.split('-') : ['', 'asc']; setSort(s); setDirection(d); }}><option value="">Padrão</option><option value="nome-asc">Título A–Z</option><option value="nome-desc">Título Z–A</option><option value="valor-asc">Menor preço</option><option value="valor-desc">Maior preço</option></select><span className="chevron">⌄</span></label></div></div>

        {error && <div className="error-banner"><span>{error}</span><button onClick={loadBooks}>Tentar novamente</button></div>}
        {loading ? <div className="loading-state"><div className="spinner"/>Carregando sua estante...</div> : filtered.length ? <div className="book-grid">{filtered.map((book, index) => <article className="book-card" key={`${book.id}-${book.nome}`}><div className="book-cover" style={{ '--cover': covers[index % covers.length] }}><div className="cover-inner"><span className="cover-symbol">{art[index % art.length]}</span><span className="cover-title">{book.nome}</span><span className="cover-author">ESTANTE · CLÁSSICOS</span></div><span className="cover-spine"/></div><div className="book-info"><div className="book-title-row"><h3>{book.nome}</h3><button className="more-button" aria-label={`Opções para ${book.nome}`} aria-expanded={openBookMenu === book.id} onClick={() => setOpenBookMenu(openBookMenu === book.id ? null : book.id)}>···</button>{openBookMenu === book.id && <div className="book-menu"><button onClick={() => toggleFavorite(book)}><span>{favorites.includes(favoriteKey(book)) ? '♥' : '♡'}</span>{favorites.includes(favoriteKey(book)) ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}</button><button onClick={() => { setDetailsBook(book); setOpenBookMenu(null); }}><span>ⓘ</span>Ver detalhes</button></div>}</div><div className="book-meta"><span className="book-tag">{favorites.includes(favoriteKey(book)) ? '♥ Favorito' : 'Livro'}</span><span className="book-price">{money(book.valor)}</span></div></div></article>)}</div> : <div className="empty-state"><span>{view === 'favorites' ? '♡' : '⌕'}</span><h3>{view === 'favorites' && !query ? 'Sua lista de favoritos está vazia' : 'Nenhum livro encontrado'}</h3><p>{view === 'favorites' && !query ? 'Use o menu de opções de um livro para salvá-lo aqui.' : query ? 'Tente buscar por outro título.' : 'Adicione seu primeiro livro para começar.'}</p>{view === 'all' && !query && <button className="primary-button" onClick={() => setModal(true)}>＋ Adicionar livro</button>}</div>}
        <footer className="footer"><span>ESTANTE <span className="brand-dot">·</span> SUA BIBLIOTECA, DO SEU JEITO</span><span>{books.length} {books.length === 1 ? 'título' : 'títulos'} catalogados</span></footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setModal(false)} aria-label="Fechar">×</button><div className="eyebrow">NOVO TÍTULO</div><h2 id="modal-title">Adicionar à estante</h2><p>Guarde os detalhes do seu próximo favorito.</p><form onSubmit={addBook}><label>Título do livro<input required maxLength="99" autoFocus placeholder="Ex.: O nome do vento" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}/></label><label>Preço <span className="currency-input"><span>R$</span><input required type="number" min="0.01" step="0.01" placeholder="0,00" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })}/></span></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar livro'}</button></div></form></section></div>}
    {detailsBook && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setDetailsBook(null); }}><section className="modal detail-modal" role="dialog" aria-modal="true" aria-labelledby="detail-title"><button className="modal-close" onClick={() => setDetailsBook(null)} aria-label="Fechar">×</button><div className="eyebrow">DETALHES DO LIVRO</div><h2 id="detail-title">{detailsBook.nome}</h2><div className="detail-price">{money(detailsBook.valor)}</div><p>Este título está na sua biblioteca pessoal.</p><div className="modal-actions"><button className="secondary-button" onClick={() => toggleFavorite(detailsBook)}>{favorites.includes(favoriteKey(detailsBook)) ? '♥ Favorito' : '♡ Adicionar aos favoritos'}</button><button className="primary-button" onClick={() => setDetailsBook(null)}>Concluir</button></div></section></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
