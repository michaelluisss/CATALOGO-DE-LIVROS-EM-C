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

  const filtered = useMemo(() => books.filter(book => book.nome.toLocaleLowerCase('pt-BR').includes(query.toLocaleLowerCase('pt-BR'))), [books, query]);
  const total = books.reduce((sum, book) => sum + Number(book.valor), 0);

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
      <a className="nav-item active" href="#"><span className="nav-icon">▤</span> Todos os livros <span className="nav-count">{books.length}</span></a>
      <div className="side-bottom"><div className="side-quote">“Um livro é um sonho que você segura com as mãos.”</div><div className="quote-author">— Neil Gaiman</div><div className="profile"><div className="avatar">L</div><div><strong>Minha estante</strong><small>Leitor(a)</small></div><span className="profile-dots">···</span></div></div>
    </aside>

    <main className="main-content">
      <header className="topbar"><div className="breadcrumb">Biblioteca <span>/</span> <strong>Todos os livros</strong></div><div className="topbar-right"><span className="status-dot"/> Biblioteca pessoal <div className="mini-avatar">L</div></div></header>
      <section className="page-content">
        <div className="intro"><div><div className="eyebrow">SUA COLEÇÃO</div><h1>Uma boa história<br className="mobile-break"/> sempre encontra espaço.</h1><p className="subtitle">Organize seus títulos favoritos, um livro de cada vez.</p></div><button className="primary-button" onClick={() => { setError(''); setModal(true); }}><span>＋</span> Adicionar livro</button></div>

        <div className="stats-row"><div className="stat-card"><span className="stat-icon mint">▤</span><div><span className="stat-label">Livros na estante</span><strong>{books.length.toString().padStart(2, '0')}</strong></div></div><div className="stat-card"><span className="stat-icon sand">◉</span><div><span className="stat-label">Valor da coleção</span><strong>{money(total)}</strong></div></div><div className="stat-note"><span className="sparkle">✳</span><span>Sua próxima leitura<br/><strong>está esperando por você.</strong></span></div></div>

        <div className="section-heading"><div><h2>Minha biblioteca <span>{filtered.length}</span></h2><p>Todos os títulos da sua coleção, em um só lugar.</p></div><div className="controls"><label className="search-box"><span>⌕</span><input aria-label="Buscar livros" placeholder="Buscar na biblioteca..." value={query} onChange={e => setQuery(e.target.value)}/><kbd>⌘ K</kbd></label><label className="sort-box"><span>Ordenar:</span><select value={sort ? `${sort}-${direction}` : ''} onChange={e => { const [s, d] = e.target.value ? e.target.value.split('-') : ['', 'asc']; setSort(s); setDirection(d); }}><option value="">Padrão</option><option value="nome-asc">Título A–Z</option><option value="nome-desc">Título Z–A</option><option value="valor-asc">Menor preço</option><option value="valor-desc">Maior preço</option></select><span className="chevron">⌄</span></label></div></div>

        {error && <div className="error-banner"><span>{error}</span><button onClick={loadBooks}>Tentar novamente</button></div>}
        {loading ? <div className="loading-state"><div className="spinner"/>Carregando sua estante...</div> : filtered.length ? <div className="book-grid">{filtered.map((book, index) => <article className="book-card" key={`${book.id}-${book.nome}`}><div className="book-cover" style={{ '--cover': covers[index % covers.length] }}><div className="cover-inner"><span className="cover-symbol">{art[index % art.length]}</span><span className="cover-title">{book.nome}</span><span className="cover-author">ESTANTE · CLÁSSICOS</span></div><span className="cover-spine"/></div><div className="book-info"><div className="book-title-row"><h3>{book.nome}</h3><button className="more-button" aria-label={`Opções para ${book.nome}`}>···</button></div><div className="book-meta"><span className="book-tag">Livro</span><span className="book-price">{money(book.valor)}</span></div></div></article>)}</div> : <div className="empty-state"><span>⌕</span><h3>Nenhum livro encontrado</h3><p>{query ? 'Tente buscar por outro título.' : 'Adicione seu primeiro livro para começar.'}</p>{!query && <button className="primary-button" onClick={() => setModal(true)}>＋ Adicionar livro</button>}</div>}
        <footer className="footer"><span>ESTANTE <span className="brand-dot">·</span> SUA BIBLIOTECA, DO SEU JEITO</span><span>{books.length} {books.length === 1 ? 'título' : 'títulos'} catalogados</span></footer>
      </section>
    </main>

    {modal && <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) setModal(false); }}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="modal-close" onClick={() => setModal(false)} aria-label="Fechar">×</button><div className="eyebrow">NOVO TÍTULO</div><h2 id="modal-title">Adicionar à estante</h2><p>Guarde os detalhes do seu próximo favorito.</p><form onSubmit={addBook}><label>Título do livro<input required maxLength="99" autoFocus placeholder="Ex.: O nome do vento" value={form.nome} onChange={e => setForm({ ...form, nome: e.target.value })}/></label><label>Preço <span className="currency-input"><span>R$</span><input required type="number" min="0.01" step="0.01" placeholder="0,00" value={form.valor} onChange={e => setForm({ ...form, valor: e.target.value })}/></span></label>{error && <div className="form-error">{error}</div>}<div className="modal-actions"><button type="button" className="secondary-button" onClick={() => setModal(false)}>Cancelar</button><button type="submit" className="primary-button" disabled={saving}>{saving ? 'Salvando...' : 'Adicionar livro'}</button></div></form></section></div>}
  </div>;
}

createRoot(document.getElementById('root')).render(<App/>);
