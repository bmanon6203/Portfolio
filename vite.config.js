export default {
  build: {
    outDir: 'public/build',
    rollupOptions: {
      input: './public/js/three.js',
      output: {
        entryFileNames: 'three.js', 
      }
    }
  }
}