
const $ = s =>document.querySelector(s)
const $$ = s => document.querySelectorAll(s)

const isMain = str => (/^#{1,2}(?!#)/).test(str)
const isSub = str => (/^#{3}(?!#)/).test(str)

const convert=raw => {
  let arr = raw.split(/\n(?=\s*#{1,3}[^#])/).filter(s => s!="").map(s => s.trim())

  let html = ''
  for(let i=0; i<arr.length; i++) {

    if(arr[i+1] !== undefined) {
      if(isMain(arr[i]) && isMain(arr[i+1])) {
        html += `
        <section data-markdown>
          <textarea data-template>
            ${arr[i]}
          </textarea>
        </section>
`
      } else if(isMain(arr[i]) && isSub(arr[i+1])) {
        html += `
        <section>
          <section data-markdown>
            <textarea data-template>
              ${arr[i]}
            </textarea>
          </section>
`
      } else if(isSub(arr[i]) && isSub(arr[i+1])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`
      } else if(isSub(arr[i]) && isMain(arr[i+1])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
</section>
`
      }      

    } else {
      if(isMain(arr[i])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
`        
      } else if(isSub(arr[i])) {
        html += `
<section data-markdown>
<textarea data-template>
${arr[i]}
</textarea>
</section>
</section>
`        
      }
    }

  }

  return html
}

const Tip = {
  init(){
    this.$text = $('.tip h2')
    this.$control = $('.control')
    
    this.bind()
  },
  bind(){
    this.$control.addEventListener("mouseover",() =>{
      this.$text.addEventListener("mouseover",() =>{
        this.$text.innerText='试试点下左边的设置'
      })
      this.$text.innerText='试试点下左边的设置'
    })
    this.$control.addEventListener("mouseout",() =>{
      this.$text.innerText = '不知道点哪里的话可以移上来看看'
    })
    
    
  }
}


const Menu = {
  init(){
    this.$settingIcon = $('.control .icon-setting')
    this.$menu = $('.menu')
    this.$closeIcon = $('.menu .icon-close')
    this.$$tabs = $$('.menu .tab')
    this.$$contents = $$('.menu .content')

    this.bind()
  },

  bind(){
    
    this.$settingIcon.onclick = () => {
      this.$menu.classList.add('open')
    }
    this.$closeIcon.onclick = () =>{
      this.$menu.classList.remove('open')
    }
    this.$$tabs.forEach( $tab => $tab.onclick = () => {
      this.$$tabs.forEach( $node => $node.classList.remove('active'))
      $tab.classList.add('active')
      let index =[...this.$$tabs].indexOf($tab)
      this.$$contents.forEach($node => $node.classList.remove('active'))
      this.$$contents[index].classList.add('active')
      
    })
  }
}

const Editor = {
  init(){
    this.$editInput = $('.editor textarea')
    this.$saveBtn = $('.editor .button-save')
    this.markdown = localStorage.markdown || `# one slide`
    this.$slideContainer = $('.slides')  

    this.bind()
    this.start()
  },

  bind(){
    this.$saveBtn.onclick = () =>{
      localStorage.markdown = this.$editInput.value
      location.reload()
      console.log(localStorage.markdown)
    }
  },

  start(){
    this.$editInput.value = this.markdown
    this.$slideContainer.innerHTML = convert(this.markdown)
    Reveal.initialize({
          controls: true,
          progress: true,
          center: localStorage.align === 'left-top' ? false : true,
          hash: true,
          transition: localStorage.transition || 'slide', // none/fade/slide/convex/concave/zoom
  
          // More info https://github.com/hakimel/reveal.js#dependencies
          dependencies: [
            { src: 'plugin/markdown/marked.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
            { src: 'plugin/markdown/markdown.js', condition: function() { return !!document.querySelector( '[data-markdown]' ); } },
            { src: 'plugin/highlight/highlight.js' },
            { src: 'plugin/search/search.js', async: true },
            { src: 'plugin/zoom-js/zoom.js', async: true },
            { src: 'plugin/notes/notes.js', async: true }
          ]
        })
  }
}

const Theme = {
  init(){
    this.$$figures = $$('.theme figure') 
    this.$transition = $('.theme .transition')
    this.$align = $('.theme .align')
    this.$reveal = $('.reveal')

    this.bind()
    this.loadTheme()
  },
  bind(){
    this.$$figures.forEach( $figure => $figure.onclick = () =>{
      this.$$figures.forEach($item => $item.classList.remove('select'))
      $figure.classList.add('select')

      this.setTheme($figure.dataset.theme)
      
    })

    this.$transition.onchange = function(){
      localStorage.transition = this.value
      location.reload()
    }

    this.$align.onchange = function(){
      localStorage.align = this.value
      location.reload()
    }
  },
  setTheme(theme){
    localStorage.theme = theme
    location.reload()
  },
  loadTheme(){
    let theme = localStorage.theme || 'beige'
    let $link = document.createElement('link')
    $link.rel = 'stylesheet'
    $link.href = `css/theme/${theme}.css`
    document.head.appendChild($link)

    Array.from(this.$$figures).find($figure => $figure.dataset.theme === theme).classList.add('select')
    this.$transition.value = localStorage.transition || 'slide'
    this.$align.value = localStorage.align || 'center'
    this.$reveal.classList.add(this.$align.value)
  }
}

const Print = {
  init(){
    this.$download = $('.download')

    this.bind()
    this.start()


  },
  bind(){
    this.$download.addEventListener('click',()=>{
      let $link = document.createElement('a')
      $link.setAttribute('target','_blank')
      $link.setAttribute('href',location.href.replace(/#\/.*/,'?print-pdf'))
      $link.click()
    })
  },
  start(){
    let link = document.createElement( 'link' );
    link.rel = 'stylesheet';
    link.type = 'text/css';
    if(window.location.search.match( /print-pdf/gi )){
      link.href ='css/print/pdf.css'
      window.print()
    }else{
      link.href ='css/print/paper.css'
    }
    document.head.appendChild( link )
  }
}

const App = {
  init(){
    [...arguments].forEach(Module => Module.init())
  }
}

App.init(Tip,Menu,Editor,Theme,Print)










