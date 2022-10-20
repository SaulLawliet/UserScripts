export function setup({ patch }) {

    const process = (item) => {
        const gpFromSale = game.stats.Items.get(item, ItemStats.GpFromSale);
        if (gpFromSale <= 0) {
            return;
        }
        if (!game.gp.canAfford(gpFromSale)) {
            fireBottomToast('You can not afford this.');
            return;
        }

        // 1. 加物品, 删统计
        const timesSold = game.stats.Items.get(item, ItemStats.TimesSold);
        game.bank.addItem(item, timesSold, false, false);
        game.stats.Items.add(item, ItemStats.TimesSold, -timesSold);
        game.stats.Items.add(item, ItemStats.GpFromSale, -gpFromSale);


        // 2. 扣钱, 删统计
        game.gp.remove(gpFromSale);
        game.stats.General.add(GeneralStats.TotalGPEarned, -gpFromSale);
        game.stats.General.add(GeneralStats.TotalItemsSold, -timesSold);

        bankSideBarMenu.statsMenu.setItem(game.bank.selectedBankItem, game);
    };

    const undoSell = () => {
        const item = game.bank.selectedBankItem.item;
        if (!item) {
            fireBottomToast('item not found.')
            return;
        }
        const quantity = game.stats.Items.get(item, ItemStats.TimesSold);
        const salePrice = game.stats.Items.get(item, ItemStats.GpFromSale);

        SwalLocale.fire({
            title: "Undo Sell Item?",
            html: `<span class='text-dark'>
            Receive ${numberWithCommas(quantity)} x ${item.name}<br>
            Send back <img class='skill-icon-xs mr-2' src='${cdnMedia("assets/media/main/coins.svg")}'>${numberWithCommas(salePrice)}
            </span>`,
            imageUrl: item.media,
            imageWidth: 64,
            imageHeight: 64,
            imageAlt: item.name,
            showCancelButton: true,
            confirmButtonText: "Undo",
        }).then((result) => {
            if (result.value) {
                process(item);
            }
        });
    };


    patch(BankItemSettingsMenu, 'initialize').after((game) => {
        const button = createElement('button', {
            className: 'btn btn-danger'
        });
        button.innerText = 'Undo Sell';
        button.onclick = () => undoSell();

        const div = createElement('div', {
            className: 'col-12'
        });
        div.appendChild(button);

        const element =  bankSideBarMenu.settingsMenu.children[0];
        element.insertBefore(div, element.children[3]);
    });
}

