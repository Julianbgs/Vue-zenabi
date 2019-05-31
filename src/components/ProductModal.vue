<template>
    <div id="productModal" class="modal">
        <div class="modal-content">
            <span class="close">x</span>
            <div class="modal-body">
                <div class="form-group">
                    <div>{{ props.product }}</div>
                </div>
                <div class="modal-footer modal__footer"></div>
            </div>
        </div>
    </div>
</template>

<script>
    export default {
        name: "product-modal"
    },
    props: {
        product: Object;
    }
</script>

<style scoped lang="scss">
    .modal {
        display: block; /* Hidden by default */
        position: fixed; /* Stay in place */
        z-index: -1; /* Sit on top */
        opacity: 0;
        transition: opacity 1s ease;
        left: 0;
        top: 0;
        width: 100%; /* Full width */
        height: 100%; /* Full height */
        overflow: auto; /* Enable scroll if needed */
        background-color: rgb(0,0,0); /* Fallback color */
        background-color: rgba(0,0,0,0.4); /* Black w/ opacity */
    }

    /* Modal Content/Box */
    .modal-content {
        background-color: #fefefe;
        margin: 15% auto; /* 15% from the top and centered */
        padding: 20px;
        border: 1px solid #888;
        width: 80%; /* Could be more or less, depending on screen size */
    }

    /* The Close Button */
    .close {
        display: block;
        position: absolute;
        top: 8px;
        right: 0;
        width: 30px;
        height: 30px;
        color: #aaa;
        font-size: 28px;
        font-weight: bold;
    }

    .close:hover,
    .close:focus {
        color: black;
        text-decoration: none;
        cursor: pointer;
    }
</style>