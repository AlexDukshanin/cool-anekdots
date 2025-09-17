

function Pagination({ page, setPage, pageSize, setPageSize, total}) {
    const totalPages = Math.ceil( total / pageSize)

    const renderPageButton = ( page, totalPages, setPage) => {
        let buttons = []

        for (let i = page - 3; i <= page + 3 ; i++) {
            if (i > 0 && i <= totalPages) {
                buttons.push(
                    <button
                    key={i}
                    onClick={() => setPage(i)}
                    className={`main-pagination-button-group-button${ page === i ? ' button-active' :
                    ''}`}>
                    {i}
                    </button>
                )
            }
        }
        return buttons
    }

    return (
        <section className="main-pagination-control">
            <div className="main-pagination-buttton-field">
                {/* Кнопка "Предыдущая страница" */}
                <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className={`main-pagination-button${ page===1 ? ' button-disabled' : ''}`}>
                    Предыдущая страница
                </button>
            
                {/* кнопки страниц (текущая +\- 3) */}
                <div className="main-pagination-button-group">
                    {renderPageButton(page, totalPages, setPage)}
                </div>
                {/* Кнопка "Следующая страница" */}
                <button
                disabled ={page >= totalPages} 
                className={`main-pagination-button${ page >= totalPages ? ' button-disabled' : ''}`}
                onClick={() => setPage(page + 1)}
            >Следующая страница</button>
            </div>

            <div className="main-pagination-buttton-field">
                {/* Показывает текущую страницу, ее номер */}
                <span className="main-pagination-info">
                    Страница {page} из {totalPages || 1}
                </span>
            </div>
            <div className="main-pagination-buttton-field">
                <p>Показать на странице
                <select 
                value={pageSize}
                onChange={(e) => {
                    setPageSize(Number(e.target.value))
                    }}>
                    <option value="5">5</option>
                    <option value="10">10</option>
                    <option value="15">15</option>
                    <option value="20">20</option>
                    <option value="25">25</option>
            </select>
            </p>

            </div>
            
        </section>
    )

}

export default Pagination