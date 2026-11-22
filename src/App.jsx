import { useEffect, useRef, useState } from 'react';
import { cars, createGame } from './game.js';

export default function App() {
  const root = useRef(null);
  const game = useRef(null);
  const [selected, setSelected] = useState(0);
  const [error, setError] = useState(false);

  useEffect(() => {
    try {
      game.current = createGame(root.current);
    } catch (error) {
      console.error(error);
      setError(true);
    }
    return () => {
      game.current?.dispose();
      game.current = null;
    };
  }, []);

  function selectCar(index) {
    if (!game.current) return;
    game.current.select(index);
    setSelected(index);
  }

  if (error) return <p role="alert">3D тоглоомыг эхлүүлж чадсангүй. WebGL дэмждэг браузераар нээгээд үзээрэй.</p>;

  return (
    <main ref={root}>
      <div id="vg"></div><div id="fl"></div>
      <div className="h" id="ps"></div><div className="h" id="lp"></div><div className="h" id="sp"></div><div className="h" id="rp"><i></i></div><div className="h" id="nt"><i></i></div>
      <div className="h" id="pp"></div><div className="h" id="dr"></div><canvas className="h" id="mm" width="200" height="150"></canvas>
      <div className="h" id="hn">W / ↑ — хийн дөрөө · S / ↓ — тоормос · A D — эргэх · SPACE — гар тоормос (дрифт) · SHIFT — нитро · R — буцаах · M — хөгжим</div>
      <div id="ov"><h1>ASPHALT<span>.</span>NIGHT</h1><p id="ovp">Шөнийн хаалттай тойрог, 8 машин, 3 тойрог. Гар тоормос дараад, ухарч эргэж дрифт хий — утаа, оч, дугуйны мөр үлдэнэ. Эхлэхээс өмнө W дараад дугуйгаа шатаа.</p><div id="cs">
                {cars.map((car, index) => (
                  <button type="button" key={car.n} className={index === selected ? 'cd on' : 'cd'}
                    aria-pressed={index === selected} onClick={() => selectCar(index)}>
                    <b>{car.n}</b><small>{car.d}</small>
                  </button>
                ))}
              </div><button id="bt" type="button" onClick={() => game.current?.start()}>Уралдаан эхлүүлэх</button></div>
    </main>
  );
}
