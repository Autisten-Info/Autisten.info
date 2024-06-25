<template>
<nav class="navbar navbar-expand-md bg-primary py-3" data-bs-theme="dark">
        <div class="container"><a class="navbar-brand d-flex align-items-center" href="#"><span class="bs-icon-sm bs-icon-rounded bs-icon-primary d-flex justify-content-center align-items-center me-2 bs-icon"><img src="assets/img/AutistenInfoLogo_Long.png" style="max-height: 30px;"></span></a><button data-bs-toggle="collapse" class="navbar-toggler" data-bs-target="#navcol-6"><span class="visually-hidden">Toggle navigation</span><span class="navbar-toggler-icon"></span></button>
            <div class="collapse navbar-collapse flex-grow-0 order-md-first" id="navcol-6">
                <ul class="navbar-nav me-auto">
                    <li class="nav-item"><a class="nav-link active" href="#">Startseite</a></li>
                    <li class="nav-item"><a class="nav-link" href="#">FooBaa</a></li>
                </ul>
                <div class="d-md-none my-2"><button class="btn btn-light me-2" type="button">Button</button><button class="btn btn-primary" type="button">Button</button></div>
            </div>
            <div class="d-none d-md-block"><a class="btn btn-light me-2" role="button" href="#">{{Test}}</a><a class="btn btn-primary" role="button" href="#">Button</a></div>
        </div>
    </nav>
</template>
<script setup>
import { ref, onMounted } from 'vue'
const Test = ref('Test')
onMounted(() => {
    console.log('AppNavbar mounted')
    Test.value = 'Hallo Welt from Vue'
})
</script>