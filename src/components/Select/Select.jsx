import css from './Select.module.css'

export default function Select({input, alterarInput, options = [], label, required = false }) {

    return (
        <div className={css.selectGroup}>
            <label className={css.titulo}>
                {label?.includes('*') ? (
                    <>
                        {label.replace(' *', '').replace('*', '')}
                        <span style={{ color: 'red', fontWeight: 'normal' }}> *</span>
                    </>
                ) : (
                    label
                )}
            </label>
            <select className={css.select1} onChange={alterarInput} value={input} required={required}>
                {options.map((opt, i) => (
                    <option key={i} value={opt}>
                        {opt}
                    </option>
                ))}
            </select>
        </div>
    )
}