# Gopher Arquitecto

Juego para pasar de los objetos en Go al diagrama de clases UML, con un solo caso: un sistema cliente–servidor.

## Niveles

Cada nivel trae 6 retos y su diagrama crece con cada uno:

| Nivel | Lo que se practica |
|---|---|
| 1 · Objetos del portal | Objeto y clase, identidad, estado y comportamiento, abstracción, encapsulación |
| 2 · Objetos en Go | `type … struct`, objetos independientes, valor cero, métodos con receptor, cliente y servidor que colaboran |
| 3 · La caja UML | Clases, atributos con su visibilidad (+ / −) y tipo, operaciones, de la caja a Go |
| 4 · El servidor de correo | Asociación, multiplicidad, composición, agregación y generalización |

Los retos son de nueve tipos: tocar en el texto lo que se pide, elegir la respuesta, predecir lo que imprime un programa, elegir el código Go, encontrar la línea que no respeta el diagrama, elegir + o − y el tipo de cada atributo, elegir la operación, elegir la relación y poner la multiplicidad. Si la respuesta no es correcta, se explica por qué esa elección no sirve, sin mostrar la correcta, y se vuelve a intentar; al acertar, el diagrama crece. El código se compiló y ejecutó con Go 1.27.

Al terminar aparece un informe de entendimiento por tema (primer intento de cada reto) y un certificado con el nombre del jugador. Solo se pide nombre y apellido; el progreso se guarda en el propio dispositivo.

Todo el contenido va cifrado y en cadena: cada reto se abre solo después de resolver bien el anterior.

## Ejecutar en local

Es un sitio estático. Desde la carpeta del repositorio:

```
python -m http.server 8000
```

y abrir `http://localhost:8000`.
