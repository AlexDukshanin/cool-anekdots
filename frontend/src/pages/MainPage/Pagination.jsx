

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
                    className={`main-pagination-buttons-group-button${ page === i ? 'button-active' :
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
            {/* Кнопка "Предыдущая страница" */}
            <button
            disabled={page === 1}
            onClick={() => setPage(page - 1)}
            className="main-pagination-button">
                Предыдущая страница
            </button>
          
            {/* кнопки страниц (текущая +\- 3) */}
            <div className="main-pagination-buttons-group">
                {renderPageButton(page, totalPages, setPage)}
            </div>
            {/* Кнопка "Следующая страница" */}
            <button
            disabled ={page >= totalPages} 
            className="main-pagination-button"
            onClick={() => setPage(page + 1)}
            >Следующая страница</button>
            {/* Показывает текущую страницу, ее номер */}
              <span className="main-pagination-info">
                Станица {page} из {totalPages || 1}
            </span>
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
        </section>
    )

}

export default Pagination