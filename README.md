[README.md](https://github.com/user-attachments/files/35252011/README.md)
# 🏎️ Retro F1 Grand Prix (Pixel Apex GP)

Um jogo de corrida retrô em **2D com visão aérea (top-down)** no estilo **pixel art** clássico dos anos 90 e era PS1/PS2 (*Micro Machines V3*, *Super Monaco GP*, *Neo Drift Out*, *Grand Prix Challenge*), desenvolvido puramente em **HTML5, Canvas e JavaScript Vanilla**.

O projeto conta com física avançada de F1, inteligência artificial competitiva, telemetria completa com velocímetro em **km/h**, zebras (*curbs*), múltiplas pistas históricas, sintetizador de áudio procedural via **Web Audio API** (sem arquivos de áudio externos para carregar) e customização completa de pintura, motor, pneus e pilotos!

---

## 🌟 Principais Recursos

- **🏁 Estilo Visual Retrô (Pixel Art & Arcade CRT)**:
  - **Câmera Dinâmica Alinhada ao Carro (Chase Cam)**: A câmera agora gira suavemente em tempo real acompanhando a direção do seu monoposto. O carro fica sempre apontado para **CIMA** na tela (com visão estendida para a frente), eliminando qualquer desorientação ao fazer curvas!
  - **Texturas Procedurais de Alta Definição**:
    - **Grama Cortada em Faixas**: Padrão realista de gramado aparado (*mown lawn*) com listras alternadas e ruído orgânico de grama.
    - **Asfalto Granulado com Linha de Borracha (*Racing Groove*)**: Textura tátil com a faixa emborrachada escurecida exatamente onde os pneus dos carros depositam borracha.
    - **Arquibancadas & Torcida (*Crowd Spectators*)**: Módulos de arquibancada com degraus de concreto, centenas de torcedores em pixel art com camisetas e bonés coloridos, bandeiras animadas tremulando ao vento e faixas oficiais de patrocinadores (*PIRELLI*, *FORMULA 1*, *ROLEX*, *HONDA*, *FERRARI TIFOSI*, *SENNA SEMPRE*).
  - Carros detalhados com aerofólios frontais e traseiros, rodas abertas animadas com faixas de compostos de pneus, halo de segurança e capacete estilizado.
  - Efeitos de partículas em tempo real: marcas persistentes de frenagem/derrapagem no asfalto, fumaça de pneus, faíscas ao raspar nas zebras e labaredas de fogo no escape durante as trocas de marchas.

- **⚙️ Física Realista de Fórmula 1 & Traçados Perfeitos**:
  - **Pistas 100% Contínuas e Sem Cruzamentos**: Traçados limpos e sem sobreposições confusas, com curvas fluidas e retas massivas.
  - **Grid de Largada Alinhado com Precisão Cirúrgica**: Todos os 8 carros são posicionados diretamente sobre os segmentos reais do asfalto, garantindo que nenhum carro fique fora da pista.
  - **Pistas Massivas e Muito Mais Largas (300px+ de largura)**: Espaço de sobra para 8 carros duelarem lado a lado (3 ou 4 monopostos na mesma reta!), permitindo ultrapassagens limpas por dentro e por fora.
  - **Zebras e Hitbox Justa**: As zebras (*curbs*) foram alargadas para 45px+ com alta aderência (98%) para você poder atacar os pontos de tangência sem perder velocidade.
  - **Menu de Pausa Completo**: Pausa instantânea via tecla `ESC`, tecla `P` ou botão na tela `⏸️ PAUSA [ESC]`.

- **🎵 Sintetizador de Áudio Aveludado & Potente (Web Audio API)**:
  - **Novo Ronco de Motor V10/V8 F1**: Reformulado com ondas harmônicas quentes, sub-graves encorpados e modulação por cilindro (LFO) para criar um som mecânico profundo e agradável, sem agudos estridentes ou zumbidos irritantes!

- **🎮 Controles Duplos (WASD & Setas)**:
  - **Acelerar**: `W` ou `Seta para Cima` (com aceleração progressiva e controle de rotação).
  - **Frear / Ré**: `S` ou `Seta para Baixo` (com frenagem e som de chiado de pastilha).
  - **Esterçar**: `A` / `D` ou `Setas Esquerda / Direita` (com ângulo de esterçamento dinâmico nas rodas dianteiras).
  - **ERS / DRS Boost**: `Barra de Espaço` (descarga de potência extra da bateria híbrida).
  - **Pausar**: `ESC` ou `P`.
  - **Repor Carro na Pista**: `R` (para desatolar de acidentes ou rodadas).

- **🗺️ 4 Circuitos Históricos do Campeonato**:
  1. 🇮🇹 **Autodromo di Monza (Itália)**: O templo da velocidade com a Parabólica, Variante del Rettifilo e Curva Grande.
  2. 🇲🇨 **Circuit de Monaco (Mônaco)**: Circuito de rua ultra técnico com o grampo mais lento da F1, Nouvelle Chicane e o túnel à beira-mar.
  3. 🇧🇷 **Autódromo de Interlagos (Brasil)**: O clássico 'S' do Senna, Curva do Sol, Descida do Lago e a Subida dos Boxes.
  4. 🇯🇵 **Suzuka Circuit (Japão)**: O mítico traçado com as Curvas em 'S', Degner, Spoon e a vertiginosa curva 130R de alta velocidade.

- **🎵 Sintetizador de Áudio e Músicas Procedurais (Web Audio API)**:
  - **Zero arquivos externos MP3/WAV!** Todo o áudio é sintetizado em tempo real via código:
    - Ronco de motor V10/V8 com osciladores harmônicos modulados pelo RPM e troca de marchas.
    - Chiado de pneu e travamento de rodas calculado pelo ângulo de derrapagem (*slip angle*).
    - Vibração tátil sonora de baixa frequência ao passar pelas zebras.
    - Beeps de contagem regressiva oficial do semáforo da FIA (5 luzes vermelhas).
    - **Música tema no menu principal** (Arcade Paddock Funk).
    - **Músicas de fundo exclusivas para cada circuito**:
      - Monza: *Eurobeat Speed Rush* (144 BPM)
      - Mônaco: *Riviera Synthwave Groove* (120 BPM)
      - Interlagos: *Brazilian Apex Samba Grand Prix* (136 BPM)
      - Suzuka: *Neo-Tokyo Cyber Rush* (142 BPM)
      - Pódio: *Fanfarra da Vitória*

- **🏎️ Garagem & Customização Livre**:
  - **5 Modelos de Monoposto com Barras de Status Dinâmicas**:
    - *Scuderia V10* (Potência bruta italiana, 355 km/h de final).
    - *Silver Arrow GP* (Engenharia alemã, equilíbrio e aceleração cirúrgica).
    - *Apex Bull RB* (Monstro do downforce, velocidade inacreditável em curvas).
    - *Heritage 98 Turbo* (Monoposto superleve com turbo agressivo).
    - *Cyber GP-2000* (Protótipo híbrido experimental com regeneração elétrica rápida).
  - Barras de status interativas que mudam em tempo real: Velocidade Máxima, Aceleração (0-100), Aderência/Curvas, Frenagem e Downforce.
  - **Pintura e Cores**: 8 librés históricas consagradas + Seletor Hexadecimal de Cores para criar qualquer tonalidade personalizada.
  - **Rodas & Aros**: Spoke clássico, Turbofan aerodinâmico, Gold Mesh retrô BBS e Estrela de magnésio.
  - **Compostos de Pneus**: Macio (Faixa Vermelha), Médio (Faixa Amarela), Duro (Faixa Branca) e Chuva (Faixa Azul com sulcos para zebras).
  - **Pacotes de Motor**: 1.6L V8 Turbo Híbrido, 3.0L V10 Aspirado Clássico, 3.5L V12 Grand Prix e Sistema Elétrico Cyber ERS.

- **👤 10 Pilotos Selecionáveis (5 Masculinos & 5 Femininos)**:
  - Cada personagem possui retrato em pixel art, número oficial, biografia e uma habilidade especial (*perk*):
    - 🇧🇷 **Ayrton Silva**: *Mestre da Chuva* (+12% de tração nas zebras e superfícies molhadas).
    - 🇬🇧 **Lewis Sterling**: *Cavaleiro do Apex* (+8% de conservação e saída de curva).
    - 🇳🇱 **Max Van Dijk**: *Ataque Implacável* (+6% de velocidade no vácuo em ultrapassagens).
    - 🇫🇷 **Jean-Luc Laurent**: *O Professor* (+10% de eficiência de frenagem).
    - 🇯🇵 **Kenji Takahashi**: *Rei do Drift de Suzuka* (+15% de estabilidade em derrapagens).
    - 🇮🇹 **Elena Rostova**: *Foguete de Monza* (+15% de aceleração de largada do grid).
    - 🇪🇸 **Sofia Martinez**: *Matadora de Mônaco* (+12% de frenagem para travar depois de todos).
    - 🇸🇪 **Maya Lindqvist**: *Valquíria do Downforce* (+10% de bônus em curvas de alta velocidade).
    - 🇫🇷 **Chloe Moreau**: *Virtuosa da Aerodinâmica* (+50% de recarga da bateria do ERS Boost).
    - 🇺🇸 **Sarah Jenkins**: *Demônio da Velocidade* (+10% de sucção de vácuo em retas).

- **📊 Telemetria Completa no HUD**:
  - Velocímetro digital grande em **km/h**.
  - Indicador de marchas (1 a 7, R).
  - Shift lights estilo F1 (15 LEDs: 5 Verdes, 5 Vermelhos e 5 Roxos piscantes no corte de giro).
  - Mini-mapa em tempo real com indicador de direção do jogador e pontos coloridos dos 7 adversários.
  - Semáforo oficial de largada da FIA com 5 luzes vermelhas.
  - Tabela de classificação com pódio comemorativo e tempos de volta (*Best Lap*, *Current Lap*, *Last Lap*).

---

## 📁 Estrutura do Repositório

```
retro-f1-grand-prix/
├── index.html              # Ponto de entrada do jogo
├── README.md               # Documentação detalhada
├── css/
│   └── style.css           # Estilos retrô arcade, painéis, CRT overlay e barras de status
└── js/
    ├── audio/
    │   ├── soundManager.js # Síntese Web Audio: motor V10, pneus, zebras, batidas, beeps
    │   └── musicSynth.js   # Sequenciador chiptune com temas musicais para menu e pistas
    ├── data/
    │   ├── cars.js         # Banco de dados de modelos F1 e atributos de física
    │   ├── drivers.js      # 10 pilotos (5 masc, 5 fem) com retratos SVG e perks
    │   ├── tracks.js       # Geometrias das pistas (Monza, Mônaco, Interlagos, Suzuka)
    │   └── upgrades.js     # Cores, aros, compostos de pneus e motores
    ├── engine/
    │   ├── camera.js       # Câmera dinâmica com lookahead e screen-shake
    │   ├── game.js         # Máquina de estados (Menu, Garagem, Corrida, Pódio)
    │   ├── input.js        # Gerenciador de teclas WASD e Setas direcionais
    │   ├── particles.js    # Partículas de faísca, fumaça, terra e marcas de pneu
    │   └── physics.js      # Dinâmica veicular de F1, marchas, downforce e superfícies
    ├── entities/
    │   ├── car.js          # Renderizador de monoposto em pixel art e lógica base
    │   ├── playerCar.js    # Controlador do jogador e integração de áudio
    │   └── aiCar.js        # IA inteligente com linha de corrida, vácuo e ultrapassagens
    └── ui/
        ├── hud.js          # Velocímetro km/h, shift lights, minimapa e semáforo
        └── menu.js         # Controlador dos menus, garagem, pilotos e configurações
```

---

## 🚀 Como Executar Localmente

Como o jogo foi construído inteiramente com tecnologias web nativas sem dependências pesadas nem downloads de assets externos, você pode jogá-lo de qualquer uma das formas abaixo:

### Opção 1: Abrir diretamente no Navegador
Basta dar um duplo-clique no arquivo `index.html` ou arrastá-lo para dentro do Google Chrome, Edge, Firefox ou Safari.

### Opção 2: Servidor Local (Node.js ou Python)
Se preferir rodar com um servidor HTTP local:

Com **Python**:
```bash
python -m http.server 8000
```
Depois acesse `http://localhost:8000`.

Com **Node.js (npx serve)**:
```bash
npx serve .
```

---

## 🌐 Publicação no GitHub Pages

Para publicar este jogo no GitHub Pages gratuitamente:
1. Crie um novo repositório no GitHub (por exemplo, `retro-f1-grand-prix`).
2. Faça o commit e push dos arquivos:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Retro F1 Grand Prix game"
   git branch -M main
   git remote add origin https://github.com/SEU_USUARIO/retro-f1-grand-prix.git
   git push -u origin main
   ```
3. No GitHub, acesse **Settings** > **Pages**.
4. Em **Branch**, selecione `main` e a pasta `/ (root)`.
5. Clique em **Save**. Em segundos seu jogo estará online para qualquer pessoa jogar no link `https://SEU_USUARIO.github.io/retro-f1-grand-prix/`!

---

## ⌨️ Tabela de Controles

| Ação | Teclado (WASD) | Teclado (Setas) |
|---|---|---|
| Acelerar | `W` | `Seta Cima` |
| Frear / Marcha Ré | `S` | `Seta Baixo` |
| Esterçar Esquerda | `A` | `Seta Esquerda` |
| Esterçar Direita | `D` | `Seta Direita` |
| ERS Boost / DRS | `Espaço` | `Espaço` |
| Pausar Corrida | `ESC` ou `P` | `ESC` ou `P` |
| Reposicionar Carro | `R` | `R` |

---

## 🏆 Créditos e Licença

Desenvolvido para entusiastas de jogos de corrida clássicos e fãs de Fórmula 1.
Licença: **MIT**. Sinta-se livre para clonar, modificar, adicionar novas pistas e criar seus próprios campeonatos!
