import { NavLink } from 'react-router-dom';
import s from './Header.module.css';

function Header() {
  return (
    <header className={s.container}>
      <nav className={s.navgation}>
        <ul className={s.list}>
          <li>
            <NavLink aria-label="Кнопка объявлений" className={s.link} to="/">
              Объявления
            </NavLink>
          </li>
          <li>
            <NavLink aria-label="Кнопка заказов" className={s.link} to="/orders">
              Заказы
            </NavLink>
          </li>
        </ul>
      </nav>
    </header>
  );
}

export default Header;
