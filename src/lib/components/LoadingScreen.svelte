<script>
  import { isLoading } from "$stores/loadingstore.js";
</script>

{#if $isLoading}
  <div class="loading-screen">
    <div class="titlediv">
      <h1>brassicaceae <span>|</span> <span>Tree of Life</span></h1>
    </div>

    <p>Loading...</p>
    <div class="cs-loader-inner">
      <p>●</p>
      <p>●</p>
      <p>●</p>
      <p>●</p>
      <p>●</p>
      <p>●</p>
    </div>
  </div>
{/if}

<style>
  .loading-screen {
    position: fixed;
    top: 0;
    left: 0;
    min-width: 100vw;
    width: 100%;
    min-height: 100vh;
    height: 100%;
    background-image: radial-gradient(#0b1818 10%, #122b27 100%);
    background-size: cover;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    z-index: 9999;

    & > p {
      color: rgba(255, 255, 255, 0.825);
      font-family: "Bayon", sans-serif;
      font-size: 2em;
      margin: 0;
    }
  }

  .titlediv {
    /* opacity: .5; */
    position: absolute;
    top: 0.75em;
    left: 2em;

    & h1 {
      font-size: 2em;
      font-family: "Abel", sans-serif;
      margin-bottom: 0.5em;
      color: #e1e1e1;

      &::before {
        content: "";
        display: inline-block;
        width: 1em;
        height: 1em;
        margin-right: 0.35em;
        margin-bottom: 0.2em;
        background-image: url("/img/croplogo.png");
        background-size: contain;
        background-repeat: no-repeat;
        vertical-align: middle;
      }

      & > span {
        &:first-of-type {
          font-family: "Times New Roman", Times, serif;
          font-weight: 100;
        }

        &:nth-of-type(2) {
          font-family: "Bayon", sans-serif;
        }
      }
    }
  }

  .cs-loader-inner {
    /* transform: translateY(-50%);
    top: 50%;
    position: absolute; */
    width: calc(100% - 200px);
    color: #fff;
    padding: 0 100px;
    text-align: center;
  }

  .cs-loader-inner p {
    font-size: 20px;
    opacity: 0;
    display: inline-block;
  }

  @keyframes lol {
    0% {
      opacity: 0;
      transform: translateX(-300px);
    }
    33% {
      opacity: 1;
      transform: translateX(0px);
    }
    66% {
      opacity: 1;
      transform: translateX(0px);
    }
    100% {
      opacity: 0;
      transform: translateX(300px);
    }
  }

  @-webkit-keyframes lol {
    0% {
      opacity: 0;
      -webkit-transform: translateX(-300px);
    }
    33% {
      opacity: 1;
      -webkit-transform: translateX(0px);
    }
    66% {
      opacity: 1;
      -webkit-transform: translateX(0px);
    }
    100% {
      opacity: 0;
      -webkit-transform: translateX(300px);
    }
  }

  .cs-loader-inner p:nth-child(6) {
    -webkit-animation: lol 3s infinite ease-in-out;
    animation: lol 3s infinite ease-in-out;
  }

  .cs-loader-inner p:nth-child(5) {
    -webkit-animation: lol 3s 100ms infinite ease-in-out;
    animation: lol 3s 100ms infinite ease-in-out;
  }

  .cs-loader-inner p:nth-child(4) {
    -webkit-animation: lol 3s 200ms infinite ease-in-out;
    animation: lol 3s 200ms infinite ease-in-out;
  }

  .cs-loader-inner p:nth-child(3) {
    -webkit-animation: lol 3s 300ms infinite ease-in-out;
    animation: lol 3s 300ms infinite ease-in-out;
  }

  .cs-loader-inner p:nth-child(2) {
    -webkit-animation: lol 3s 400ms infinite ease-in-out;
    animation: lol 3s 400ms infinite ease-in-out;
  }

  .cs-loader-inner p:nth-child(1) {
    -webkit-animation: lol 3s 500ms infinite ease-in-out;
    animation: lol 3s 500ms infinite ease-in-out;
  }
</style>
