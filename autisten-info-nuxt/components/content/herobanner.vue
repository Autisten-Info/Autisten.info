<template>
<div class="text-center border rounded p-4 p-lg-5" style="background: linear-gradient(0deg, var(--bs-body-bg) 13%, rgba(255,255,255,0.25)), url(&quot;https://picsum.photos/600/300&quot;) center / cover;">
                        <p class="fw-bold text-primary mb-2"><slot name="description"/></p>
                        <h1 class="fw-bold mb-4"><slot/></h1><button class="btn btn-primary fs-5 me-2 py-2 px-4" type="button">Button</button><button class="btn btn-light fs-5 py-2 px-4" type="button">Button</button>
                    </div>
</template>